var express = require('express');
var auth = require('../lib/auth');

var router = express.Router();
router.post('/login', auth.login);
router.post('/logout', auth.logout);
router.get('/ping', auth.ping);
module.exports = router;
