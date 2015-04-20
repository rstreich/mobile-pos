/**
 * 
 */

var async = require('async');
var Big = require('big.js');
var factory = require('../lib/queryFactory');
var ServerError = require('../lib/server-error');

//TODO: MAYBE--Add optimistic locking.
/* jshint laxbreak:true */
var baseSelect = 'SELECT Sales.id AS saleId,'
    +  ' Sales.saleDate AS saleDate,'
    +  ' Users.name AS soldBy,'
    +  ' Sales.totalCollected as total,'
    +  ' Items.name AS item,'
    +  ' SoldItems.quantity AS quantity,'
    +  ' SoldItems.unitPrice AS unitPrice,'
    +  ' UnitsOfMeasure.name AS uom'
    + ' FROM Sales'
    + ' JOIN SoldItems'
    +  ' ON Sales.id = SoldItems.sale'
    + ' JOIN Users'
    +  ' ON Sales.soldBy = Users.id'
    + ' JOIN Locations'
    +  ' ON Sales.location = Locations.id'
    + ' JOIN Items'
    +  ' ON SoldItems.item = Items.id'
    + ' JOIN UnitsOfMeasure'
    +  ' ON Items.uom = UnitsOfMeasure.id';

var selectById = baseSelect + ' WHERE ?';

var soldItemPropsIn = ['quantity', 'unitPrice', 'item'];
var soldItemPropsOut = soldItemPropsIn.concat('sale');

var saleProps = ['location', 'totalCollected', 'soldBy'];

var saleInsertSql = 'INSERT INTO Sales SET ?';
var soldItemsInsertSql = 'INSERT INTO SoldItems(??) VALUES ?';

var getQuery = factory.makeSimpleGet(selectById);

exports.get = function getSale(saleId, callback) {
    getQuery({ 'Sales.id': saleId }, function(err, result) {
        if (err) {
            return callback(err);
        } else if (!result) {
            callback(null, null);
        } else {
            var sale = { id: result[0].saleId, saleDate: result[0].saleDate, soldBy: result[0].soldBy, totalCollected: result[0].total};
            var soldItems = [];
            for (var i = 0; i < result.length; ++i) {
                soldItems.push({ item: result[i].item, quantity: result[i].quantity, unitPrice: result[i].unitPrice, uom: result[i].uom });
            }
            sale.soldItems = soldItems;
            return callback(null, sale);
        }
    });
};

exports.insert = function insert(sale, callback) {
    var discreteSale = { location: sale.location, totalCollected: sale.totalCollected, soldBy: sale.soldBy };

    factory.pool.getConnection(function(err, c) {
        if (err) {
            return callback(err);
        }
        return async.waterfall([
            function beginTransaction(asyncCallback) {
                c.beginTransaction(function beginTransactionCallback(err) {
                    if (err) {
                        return asyncCallback(err);
                    }
                    return asyncCallback(null);
                })
            },
            function writeSale(asyncCallback) {
                c.query(saleInsertSql, discreteSale, function writeSaleCallback(err, result) {
                    if (err) {
                        return asyncCallback(err);
                    }
                    // Result can be undefined if the insert call was malformed.
                    if (!result) {
                        return asyncCallback(new ServerError(500, 'Insert failed.', null));
                    }
                    return asyncCallback(null, result.insertId);
                })
            },
            function writeSoldItems(saleId, asyncCallback) {
                var soldItemVals = [];
                for (var i = 0; i < sale.soldItems.length; ++i) {
                    var soldItemVal = [];
                    for (var j = 0; j < soldItemPropsIn.length; ++j) {
                        soldItemVal.push(sale.soldItems[i][soldItemPropsIn[j]]);
                    }
                    soldItemVal.push(saleId);
                    soldItemVals.push(soldItemVal);
                }
                c.query(soldItemsInsertSql, [soldItemPropsOut, soldItemVals], function writeSoldItemsCallback(err, result) {
                    if (err) {
                        return asyncCallback(err);
                    }
                    return asyncCallback(null, saleId);
                });
            }
        ],
        function mainCallback(err, saleId) {
            if (err) {
                return c.rollback(function() {
                    callback(err);
                });
            } else {
                c.commit(function(err) {
                    if (err) {
                        return callback(err);
                    }
                    discreteSale.id = saleId;
                    return callback(null, discreteSale);
                });
            }
        });
    });
};

function createDiscreteSale(inboundSale) {
    var sale = {};
    if (inboundSale.location) {
        sale.location = inboundSale.location.id || null;
    }
    if (inboundSale.soldBy) {
        sale.soldBy = inboundSale.soldBy.id || null;
    }
    if (!Number.isNaN(Number(inboundSale.totalCollected))){
        sale.totalCollected = new Big(inboundSale.totalCollected);
    }
    return sale;
}

function createDiscreteSoldItem(inboundSoldItem) {
    var soldItem = {};
    soldItem.quantity = inboundSoldItem.quantity || null;
    if (inboundSoldItem.item) {
        soldItem.item = inboundSoldItem.item.id || null;
        if (!Number.isNaN(Number(inboundSoldItem.item.unitPrice))) {
            soldItem.unitPrice = new Big(inboundSoldItem.item.unitPrice);
        }
    }
    return soldItem;
}

exports.createSale = function createCleanSale(inboundSale) {
    var sale = createDiscreteSale(inboundSale);
    var inboundSoldItems = inboundSale.soldItems;
    if (Array.isArray(inboundSoldItems)) {
        sale.soldItems = [];
        for (var i = 0; i < inboundSoldItems.length; ++i) {
            sale.soldItems.push(createDiscreteSoldItem(inboundSoldItems[i]));
        }
    }
    return sale;
};