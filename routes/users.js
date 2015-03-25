var express = require('express');
var router = express.Router();
var users = require('../controllers/users');
var auth = require('../controllers/auth');

var root = router.route('/');
root.get(auth.verifyAuthenticated, auth.verifyAdmin, users.getAll); // Admin only
root.post(auth.verifyAuthenticated, auth.verifyAdmin, users.insert); // Admin only

var specifiedUser = router.route('/:id');
specifiedUser.get(auth.verifyAuthenticated, auth.verifyAdmin, users.get); // Admin only
specifiedUser.put(auth.verifyAuthenticated, auth.verifyAdmin, users.update); // Admin only

router.put('/:id/pwd', auth.verifyAuthenticated, auth.verifySelfUpdate, users.update); // Self

module.exports = router;
