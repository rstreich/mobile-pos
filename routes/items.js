var express = require('express');
var router = express.Router();
var items = require('../controllers/items');
var auth = require('../controllers/auth');

var root = router.route('/');
root.get(auth.verifyAuthenticated, items.getAll); // Catalog view
root.post(auth.verifyAuthenticated, auth.verifyAdmin, items.insert); // Admin only

var specifiedItem = router.route('/:id');
specifiedItem.get(auth.verifyAuthenticated, items.get);
specifiedItem.put(auth.verifyAuthenticated, auth.verifyAdmin, items.update); // Admin only

module.exports = router;
