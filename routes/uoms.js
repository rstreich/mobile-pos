var express = require('express');
var router = express.Router();
var uoms = require('../controllers/uoms');
var auth = require('../lib/auth');

router.route('/')
.get(uoms.getAll)
.post(auth.verifyAdmin, uoms.insert); // Admin only

router.route('/:id')
.get(uoms.get)
.head(auth.verifyAdmin, uoms.exists) // Admin only
.put(auth.verifyAdmin, uoms.update); // Admin only

module.exports = router;
