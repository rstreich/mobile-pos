var express = require('express');
var router = express.Router();
var auth = require('../controllers/auth');

router.post('/login', auth.login, auth.loginSuccess);

router.get('/logout', auth.logout);

module.exports = router;
