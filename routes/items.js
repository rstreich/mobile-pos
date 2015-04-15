var express = require('express');
var router = express.Router();
var items = require('../controllers/items');
var auth = require('../controllers/auth');

var root = router.route('/');
root.get(items.getAll); // Catalog view
root.post(auth.verifyAdmin, items.insert); // Admin only

var specifiedItem = router.route('/:id');
specifiedItem.get(items.get);
specifiedItem.put(auth.verifyAdmin, items.update); // Admin only

module.exports = router;
