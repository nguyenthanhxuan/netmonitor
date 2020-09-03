const express = require('express');
const router = express.Router();

router.route('/').get((req, res) => {
    res.render('pages/login', {
        title: 'Đăng nhập',
        message: 'Xin chào bạn',
        page_class: 'text-center login-page',
        user: req.user,
    });
});

module.exports = router;
