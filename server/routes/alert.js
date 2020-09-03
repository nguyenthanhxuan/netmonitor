const express = require('express');
const router = express.Router();
const moment = require('moment');
const {
    getActiveUser,
    removeAdminUser,
} = require('../controller/UserController');

router.route('/').post(async (req, res) => {
    let activeUsers = removeAdminUser(await getActiveUser(req.db));
    let timeDown = moment(req.body.lastDownTime).format('MMMM Do YYYY, h:mm:ss a');
    let message = `Mất kết nối [${req.body.name}] host/domain [${req.body.host}] tại máy chủ [${req.body.agent}], thời gian lúc [${timeDown}]`;
    if(req.body.totalDies == 10){
        message += ` 10 lần, hệ thống sẽ dừng cảnh báo;\nQuản trị mạng hãy kiểm tra kết nối gấp!!!`;
    }
    await req.Line.sendMessage(message, process.env.ADMIN_LINE_USER);
    activeUsers.forEach(function (user) {
        (async () => {
            console.log(message);
            await req.Zalo.sendMessage(message, '', user.uid.toString());
        })();
    });
    res.status(200).send({ success: true });
});

module.exports = router;
