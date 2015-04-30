var express = require('express');
var router = express.Router();
var users = require('../controllers/users');
var auth = require('../lib/auth');

router.route('/')
.get(auth.verifyAdmin, users.getAll) // Admin only
.post(auth.verifyAdmin, users.insert); // Admin only

router.route('/:id')
.get(auth.verifyAdmin, users.get) // Admin only
.head(auth.verifyAdmin, users.exists) // Admin only
.put(auth.verifyAdmin, users.update); // Admin only

router.put('/:id/pwd', auth.verifySelfUpdate, users.update); // Self

module.exports = router;
