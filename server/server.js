const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const ZaloStategy = require('@xvn/passport-zalo');
const Zalo = require('./controller/ZaloController');
const Line = require('./controller/LineController');
const UserModel = require('./models/UserModel');
const { userDisable, userEnable, getActiveUser, removeAdminUser } = require('./controller/UserController');
const { getActiveAgent, deleteAgent, changeAgentStatus } = require('./controller/AgentController');
const moment = require('moment');
const session = require( 'express-session' );
const FirestoreStore = require( 'firestore-store' )(session);
const db = require('./config/db');
dotenv.config({ path: './config/config.env' });


// WEB SERVER
const app = express();

// SOCKET IO
let http = require('http').createServer(app);
let io = require('socket.io')(http);
let socket = null;

io.on('connection', (serverConnection) => {
    console.log('a user connected');
    socket = serverConnection;

    socket.on('user-click', (data) => {
        console.log(data);
    });

    socket.on('user-disable', (uid) => {
        userDisable(db, uid);
        socket.emit('user-disabled', uid);
    });

    socket.on('user-enable', (uid) => {
        userEnable(db, uid);
        socket.emit('user-enabled', uid);
    });

    socket.on('agent-delete', (agentId) => {
        deleteAgent(db, agentId);
        socket.emit('agent-deleted', agentId);
    });
});

// CONNECT TO ZALO LOGIN
passport.use(
    new ZaloStategy(
        {
            appId: '3622534041368933457',
            appSecret: 'HB2PC2BBJXnXSID650CW',
            callbackURL: 'https://ebc525cec144.ngrok.io/auth/zalo/callback',
            state: 'netmonitorserver',
        },
        function (request, accessToken, profile, cb) {
            // Do anything with params above
            profile.oauthCode = request.query.code;
            return cb(profile);
        }
    )
);


passport.serializeUser(function (user, cb) {
    cb(null, user);
    // console.log('seriallize run');
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


// ZALO CONNECT
const ZaloAction = new Zalo('3622534041368933457', 'HB2PC2BBJXnXSID650CW', db);

// Line Connect
const LineAction = new Line();

// Add zalo to all req
const MiddleWare = async (req, res, next) => {
    req.Zalo = ZaloAction;
    req.Line = LineAction;
    req.db = db;
    req.sendToClient = socket;
    next();
}

// Send alert if agent down
const alertAgentDown = async (agent) => {
    let activeUsers = await getActiveUser(db);
    let activeUsersExceptAdmin = removeAdminUser(activeUsers);
    let agentDownMessage = `Mất kết nối với máy chủ ${agent.name}, hãy kiểm tra gấp`;
    // Send to admin user first
    await LineAction.sendMessage(agentDownMessage, process.env.ADMIN_LINE_USER);

    // Send to active user
    activeUsersExceptAdmin.forEach(function (user) {
        (async () => {
            console.log(agentDownMessage);
            await ZaloAction.sendMessage(agentDownMessage, '', user.uid.toString());
        })();
    });

    l
} 

// Check active agent
setInterval(() => {
    (async () => {
        let agents = await getActiveAgent(db);
        agents.forEach(function(agent){
            let now = moment();
            let lastHelloSend = moment(agent.lastHelloSend);
            let diff = now.diff(lastHelloSend, 'seconds');
            // if agent not send hello each 10 minutes --> send alert
            if(diff > 600){
                alertAgentDown(agent);
                changeAgentStatus(db, agent.id, false);
            }
        })
    })();
// Check monitor each 7 minutes = 420 000 miliseconds
}, 420000);


// Add user logged status
const getUserStatus = async (req, res, next) => {
    if(req.user != undefined && req.user.user_data.id){
        const userData = new UserModel(db);
        let userObject = await userData.findById(req.user.user_data.id);
        req.user.user_data.status = userObject.status;
    }

    next();
}

app.use(express.static('assets'));

app.use(
    session({
        store: new FirestoreStore( {
            database: db
        }),
        secret: 'netmonitorserver',
        resave: true,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(MiddleWare);
app.use(getUserStatus);
// ROUTE
app.use('/', require('./routes/index'));
app.use('/hello', require('./routes/hello'));
app.use('/update', require('./routes/update'));
app.use('/alert', require('./routes/alert'));
app.use('/login', require('./routes/login'));
app.use('/monitor', require('./routes/monitor'));
app.use('/config', require('./routes/config'));

// SET TEMPLATE
app.set('view engine', 'pug');

// APP ROUTE ZALO AUTHENTICATION
app.get('/auth/zalo', passport.authenticate('zalo'));
app.get(
    '/auth/zalo/callback',
    passport.authenticate('zalo', { failureRedirect: '/login' }),
    async function (req, res) {
        
        // Successful authentication, redirect home.
        let userZalo = req.user;
        const user = new UserModel(db);
        let userObject = await user.add(userZalo.name, userZalo.picture.data.url, userZalo.id, false, userZalo.oauthCode, Date.now(), false);
        req.user.user_data = userObject;

        res.redirect('/');
    }
);
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

const PORT = process.env.PORT || 8888;

http.listen(
    PORT,
    console.log(
        `Server running on port ${PORT}`
    )
);
