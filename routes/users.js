var express = require('express');
var router = express.Router();
var users = require('../controllers/users');
var auth = require('../controllers/auth');

var root = router.route('/');
root.get(auth.verifyAdmin, users.getAll); // Admin only
root.post(auth.verifyAdmin, users.insert); // Admin only

var specifiedUser = router.route('/:id');
specifiedUser.get(auth.verifyAdmin, users.get); // Admin only
specifiedUser.put(auth.verifyAdmin, users.update); // Admin only

router.put('/:id/pwd', auth.verifySelfUpdate, users.update); // Self

module.exports = router;
