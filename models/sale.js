/**
 * 
 */

var factory = require('../lib/queryFactory');

//TODO: MAYBE--Add optimistic locking.
/* jshint laxbreak:true */
var baseSelect = 'SELECT Sales.id AS saleId,'
    +  ' Sales.saleDate AS saleDate,'
    +  ' Users.name AS soldBy,'
    +  ' Sales.totalPrice as total,'
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
var soldItemPropsOut = ['quantity', 'unitPrice', 'item', 'sale'];

var saleProps = ['location', 'totalPrice', 'soldBy'];

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
            var sale = { id: result[0].saleId, saleDate: result[0].saleDate, soldBy: result[0].soldBy, totalPrice: result[0].total};
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
    var discreetSale = { location: sale.location, totalPrice: sale.totalPrice, soldBy: sale.soldBy };

    factory.pool.getConnection(function(err, c) {
        if (err) {
            callback(err);
        } else {
            try {
                c.beginTransaction(function(err) {
                    if (err) {
                        throw err;
                    }
                    c.query(saleInsertSql, discreetSale, function writeSaleCallback(err, result) {
                        if (err) {
                            c.rollback(function() {
                                throw err;
                            });
                        }
                        // Result can be undefined if the insert call was malformed.
                        if (!result) {
                            c.rollback(function() {
                                throw err;
                            });
                        }
                        var saleId = result.insertId;
                        for (var i = 0; i < sale.soldItems.length; ++i) {
                            sale.soldItems[i].sale = saleId;
                        }
                        c.query(soldItemsInsertSql, [soldItemPropsOut, sale.soldItems], function writeSoldItemsCallback(err, result) {
                            if (err) {
                                c.rollback(function() {
                                    throw err;
                                });
                            }
                            c.commit(function(err) {
                                if (err) {
                                    c.rollback(function() {
                                        throw err;
                                    });
                                }
                                callback(null, saleId);
                            });
                        });
                    });
                });
            } catch (err) {
                callback(err);
            }
        }
    });
};

var createDiscreetSale = factory.createCleanObjectFunction(saleProps);
var createDiscreetSoldItem = factory.createCleanObjectFunction(soldItemPropsIn);

exports.createSale = function createCleanSale(inboundSale) {
    var sale = createDiscreetSale(inboundSale);
    var inboundSoldItems = inboundSale.soldItems;
    if (Array.isArray(inboundSoldItems)) {
        sale.soldItems = [];
        for (var i = 0; i < inboundSoldItems.length; ++i) {
            sale.soldItems.push(createDiscreetSoldItem(inboundSoldItems[i]));
        }
    }
    return sale;
};