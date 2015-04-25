var express = require('express');
var router = express.Router();
var locations = require('../controllers/locations');
var auth = require('../controllers/auth');

router.route('/')
.get(locations.getAll)
.post(auth.verifyAdmin, locations.insert); // Admin only

router.route('/:id')
.get(locations.get)
.head(auth.verifyAdmin, locations.exists) // Admin only
.put(auth.verifyAdmin, locations.update); // Admin only

module.exports = router;
