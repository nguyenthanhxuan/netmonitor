const express = require('express');
const router = express.Router();
const { getAllAgent } = require('../controller/AgentController');

router.route('/').get(async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect('/login');
    if(!req.user.user_data.status) return res.redirect('/');
    const agents = await getAllAgent(req.db);
    res.render('pages/monitor', {
        title: 'Theo dõi mạng TT THDL',
        message: 'Trang theo dõi',
        page_class: 'monitor-page',
        agents: agents,
        user: req.user,
    });
});

module.exports = router;
