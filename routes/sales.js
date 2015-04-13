var express = require('express');
var router = express.Router();
var sales = require('../controllers/sales');
var auth = require('../controllers/auth');

var root = router.route('/');
root.post(auth.verifyAuthenticated, sales.insert);

var specifiedItem = router.route('/:id');
specifiedItem.get(auth.verifyAuthenticated, sales.get);

module.exports = router;
