const express = require('express');
const router = express.Router();
const { addAgent } = require('../controller/AgentController');

router.route('/').post((req, res) => {
    let data = req.body;
    let agent_name = data.agent;
    let agent_ip = data.ip;
    let lastHelloSend = Date.now();
    let status = true;
    let db = req.db;
    
    addAgent(db, agent_name, agent_ip, lastHelloSend, status);

    res.status(200).json({ success: true });
});

module.exports = router;
