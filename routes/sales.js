var express = require('express');
var router = express.Router();
var sales = require('../controllers/sales');

router.route('/')
.post(sales.insert)
.get(sales.query);

router.route('/:id')
.get(sales.get);

module.exports = router;
