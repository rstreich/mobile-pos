var express = require('express');
var router = express.Router();
var locations = require('../controllers/locations');
var auth = require('../controllers/auth');

var root = router.route('/');
root.get(auth.verifyAuthenticated, locations.getAll);
root.post(auth.verifyAuthenticated, auth.verifyAdmin, locations.insert); // Admin only

var specifiedLocation = router.route('/:id');
specifiedLocation.get(auth.verifyAuthenticated, locations.get);
specifiedLocation.put(auth.verifyAuthenticated, auth.verifyAdmin, locations.update); // Admin only

module.exports = router;
