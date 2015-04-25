var express = require('express');
var router = express.Router();
var items = require('../controllers/items');
var auth = require('../controllers/auth');

router.route('/')
.get(items.getAll) // Catalog view
.post(auth.verifyAdmin, items.insert); // Admin only

router.route('/:id')
.get(items.get)
.head(auth.verifyAdmin, items.exists) // Admin only
.put(auth.verifyAdmin, items.update); // Admin only

module.exports = router;
