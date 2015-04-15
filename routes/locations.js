var express = require('express');
var router = express.Router();
var locations = require('../controllers/locations');
var auth = require('../controllers/auth');

var root = router.route('/');
root.get(locations.getAll);
root.post(auth.verifyAdmin, locations.insert); // Admin only

var specifiedLocation = router.route('/:id');
specifiedLocation.get(locations.get);
specifiedLocation.put(auth.verifyAdmin, locations.update); // Admin only

module.exports = router;
