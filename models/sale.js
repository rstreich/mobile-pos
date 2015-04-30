/**
 * 
 */

var async = require('async');
var Big = require('big.js');
var factory = require('../lib/queryFactory');
var ServerError = require('../lib/errors');

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
    + ' JOIN SoldItems ON Sales.id = SoldItems.sale'
    + ' JOIN Users ON Sales.soldBy = Users.id'
    + ' JOIN Locations ON Sales.location = Locations.id'
    + ' JOIN Items ON SoldItems.item = Items.id'
    + ' JOIN UnitsOfMeasure ON Items.uom = UnitsOfMeasure.id';

var selectById = baseSelect + ' WHERE ?';

/* jshint laxbreak:true */
var totalsByLocation = 'SELECT Locations.name as Location,' +
      ' format(sum(Sales.totalCollected), 2) as Total' +
    ' FROM Sales' +
    ' JOIN Locations ON Sales.location = Locations.id' +
    ' WHERE Sales.saleDate BETWEEN ? AND ?' +
    ' GROUP BY Location' +
    ' ORDER BY Location';

var totalsByItem = 'SELECT Items.name as Item,' +
      ' format(sum(SoldItems.quantity), 2) as Quantity,' +
      ' UnitsOfMeasure.name as Unit,' +
      ' format(sum(SoldItems.quantity * SoldItems.unitPrice), 2) as Total' +
    ' FROM SoldItems' +
    ' JOIN Items ON SoldItems.item = Items.id' +
    ' JOIN UnitsOfMeasure ON Items.uom = UnitsOfMeasure.id' +
    ' JOIN Sales on SoldItems.sale = Sales.id' +
    ' WHERE Sales.saleDate BETWEEN ? AND ?' +
    ' GROUP BY Item' +
    ' ORDER BY Item';

function makeComboQuery(arg1, arg2) {
    return 'SELECT ' + arg1 + 's.name as ' + arg1 + ',' +
          ' ' + arg2 + 's.name as ' + arg2 + ',' +
          ' format(sum(SoldItems.quantity), 2) as Quantity,' +
          ' UnitsOfMeasure.name as Unit,' +
          ' format(sum(SoldItems.quantity * SoldItems.unitPrice), 2) as Total' +
        ' FROM SoldItems' +
        ' JOIN Items ON SoldItems.item = Items.id' +
        ' JOIN UnitsOfMeasure ON Items.uom = UnitsOfMeasure.id' +
        ' JOIN Sales ON SoldItems.sale = Sales.id' +
        ' JOIN Locations ON Sales.location = Locations.id' +
        ' WHERE Sales.saleDate BETWEEN ? AND ?' +
        ' GROUP BY ' + arg1 + ', ' + arg2 +
        ' ORDER BY ' + arg1 + ', ' + arg2;
}

var totalsByItemLocation = makeComboQuery('Item', 'Location');
var totalsByLocationItem = makeComboQuery('Location', 'Item');

var soldItemPropsIn = ['quantity', 'unitPrice', 'item'];
var soldItemPropsOut = soldItemPropsIn.concat('sale');

var saleProps = ['location', 'totalCollected', 'soldBy'];

var saleInsertSql = 'INSERT INTO Sales SET ?';
var soldItemsInsertSql = 'INSERT INTO SoldItems(??) VALUES ?';

var getQuery = factory.makeSimpleGet(selectById);
var totalsByLocationQuery = factory.makeSimpleGet(totalsByLocation);
var totalsByItemQuery = factory.makeSimpleGet(totalsByItem);
var totalsByItemLocationQuery = factory.makeSimpleGet(totalsByItemLocation);
var totalsByLocationItemQuery = factory.makeSimpleGet(totalsByLocationItem);

exports.get = function getSale(saleId, callback) {
    return getQuery({ 'Sales.id': saleId }, function(err, result) {
        if (err) {
            return callback(err);
        } else if (!result) {
            return callback(null, null);
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

function makeDualGroupResultHandler(callback) {
    return function handleDualGroupResult(err, results, fields) {
        if (err) {
            return callback(err);
        } else if (!results) {
            return callback(null, null);
        }
        var ret = {
            axes: 2,
            headers: [],
            table: []
        };
        for (var i = 0; i < fields.length; ++i) {
            ret.headers.push(fields[i].name);
        }
        var col1Name = null;
        var primeObj = null;
        for (i = 0; i < results.length; ++i) {
            // New group
            if (col1Name !== results[i][fields[0].name]) {
                col1Name = results[i][fields[0].name];
                primeObj = {};
                primeObj.col1 = col1Name;
                primeObj.rows = [];
                ret.table.push(primeObj);
            }
            // Ensure columns are ordered the same as the headers.
            var row = [];
            for (var j = 1; j < fields.length; ++j) {
                row.push(results[i][fields[j].name]);
            }
            primeObj.rows.push(row);
        }
        return callback(null, ret);
    };
}

function makeSingleGroupResultHandler(callback) {
    return function handleSingleGroupResult(err, results, fields) {
        if (err) {
            return callback(err);
        } else if (!results || 1 > results.length) {
            return callback(null, null);
        }
        var ret = {
            axes: 1,
            headers: [],
            table: []
        };
        for (var i = 0; i < fields.length; ++i) {
            ret.headers.push(fields[i].name);
        }
        for (i = 0; i < results.length; ++i) {
            // Ensure columns are ordered the same as the headers.
            var row = [];
            for (var j = 0; j < fields.length; ++j) {
                row.push(results[i][fields[j].name]);
            }
            ret.table.push(row);
        }
        return callback(null, ret);
    };
}

exports.query = function(table1, table2, fromDate, toDate, callback) {
    // This leaves testing of table2 validity incomplete.
    if (table1 === 'Location') {
        if (table2 === 'Item') {
            return totalsByLocationItemQuery([fromDate, toDate], makeDualGroupResultHandler(callback));
        }
        return totalsByLocationQuery([fromDate, toDate], makeSingleGroupResultHandler(callback));
    } else if (table1 === 'Item') {
        if (table2 === 'Location') {
            return totalsByItemLocationQuery([fromDate, toDate], makeDualGroupResultHandler(callback));
        }
        return totalsByItemQuery([fromDate, toDate], makeSingleGroupResultHandler(callback));
    }
    return callback(new ServerError(400, 'Invalid argument for table1: ' + table1, null));
};

exports.insert = function insert(sale, callback) {
    var discreteSale = { location: sale.location, totalCollected: sale.totalCollected, soldBy: sale.soldBy };

    return factory.pool.getConnection(function(err, c) {
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