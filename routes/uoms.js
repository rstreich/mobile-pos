var express = require('express');
var router = express.Router();
var uoms = require('../controllers/uoms');
var auth = require('../controllers/auth');

var root = router.route('/');
root.get(uoms.getAll);
root.post(auth.verifyAdmin, uoms.insert); // Admin only

var specifiedUnitOfMeasure = router.route('/:id');
specifiedUnitOfMeasure.get(uoms.get);
specifiedUnitOfMeasure.put(auth.verifyAdmin, uoms.update); // Admin only

module.exports = router;
