const express = require('express');
const router = express.Router();
const moment = require('moment');
const { getAllUser, removeAdminUser } = require('../controller/UserController');
const { getAllAgent } = require('../controller/AgentController');

router.route('/').get(async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect('/login');
    if(!req.user.user_data.isAdmin) return res.redirect('/');
    const users = removeAdminUser(await getAllUser(req.db));
    let agents = await getAllAgent(req.db);
    for (let i = 0; i < agents.length; i++) {
        agents[i].hello = moment(agents[i].lastHelloSend).format('MMMM Do YYYY, h:mm:ss a');
    }

    res.render('pages/config', {
        title: 'Cấu hình',
        message: 'Xin chào bạn',
        page_class: 'config-page',
        users: users,
        user: req.user,
        agents: agents
    });
});

module.exports = router;
