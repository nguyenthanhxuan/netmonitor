const express = require('express');
const router = express.Router();

router.route('/').get((req, res) => {
    if(!req.isAuthenticated()) return res.redirect('/login');
    console.log(req.user);
    res.render('pages/index', {
        title: 'Phần mềm theo dõi mạng TT THDL',
        message: 'Xin chào bạn',
        page_class: 'index-page',
        user: req.user,
    });
});

module.exports = router;
