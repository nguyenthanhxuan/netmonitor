const express = require('express');
const router = express.Router();
const moment = require('moment');

router.route('/').post((req, res) => {
    let socket = req.sendToClient;

    if(req.body.nets.length != 0){
        for (let i = 0; i < req.body.nets.length; i++) {
            if(req.body.nets[i].monitor_state.lastRequest != null){
                let now = moment();
                let lastRequest = moment(req.body.nets[i].monitor_state.lastRequest);
                req.body.nets[i].fromNow = now.diff(lastRequest, 'seconds') + 's trước';
            } else {
                req.body.nets[i].fromNow = 'Tạm dừng';
            }
            
        }
    }

    if (socket != null) {
        socket.emit('hello', req.body);
    }

    res.status(200).json({ success: true });
});

module.exports = router;
