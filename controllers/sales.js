/**
 * 
 */

var saleModel = require('../models/sale');
var itemModel = require('../models/item');
var protocol = require('../www/js/protocol');
var Big = require('big.js');
var ServerError = require('../lib/server-error');

exports.get = function getSale(req, res, next) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return next(new ServerError(400, 'Invalid ID: ' + req.params.id, null));
    }
    return saleModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results) {
            return next(new ServerError(404, 'No sale found for sale ID: ' + id, null));
        }
        return protocol.writeData(req, res, results);
    });
};

exports.insert = function insertSale(req, res, next) {
    // Make a pristine object
    var jsonInput = protocol.getJsonInput(req);
    var sale = saleModel.createSale(jsonInput);
    // Validate input.
    if (!sale) {
        return next(new ServerError(400, 'No sale provided.', null));
    } else if (!sale.location) {
        return next(new ServerError(400, 'Missing location.', null));
    } else if (!sale.soldBy) {
        return next(new ServerError(400, 'Missing sold by.', null));
    } else if (!sale.totalCollected) {
        return next(new ServerError(400, 'Missing total price.', null));
    } else if (!sale.soldItems) {
        return next(new ServerError(400, 'Missing list of items sold.', null));
    } else {
        var actualTotal = new Big(0);
        // We know it's either null or an array.
        for (var i = 0; i < sale.soldItems.length; ++i) {
            var soldItem = sale.soldItems[i];
            if (!soldItem.quantity) {
                return next(new ServerError(400, 'Missing quantity.', null));
            } else if (!soldItem.unitPrice) {
                return next(new ServerError(400, 'Missing unit price.', null));
            } else if (!soldItem.item) {
                return next(new ServerError(400, 'Missing item.', null));
            }
            actualTotal = actualTotal.plus(soldItem.unitPrice.times(soldItem.quantity));
        }
        
        // Make up for discrepancies between real price and tendered price, if any.
        if (actualTotal.lt(sale.totalCollected)) {
            // Add a donation item.
            sale.soldItems.push({ quantity: sale.totalCollected.minus(actualTotal), unitPrice: new Big(1), item: itemModel.DONATION_ID });
        } else if (actualTotal > sale.totalCollected) {
            // Add a discount item
            sale.soldItems.push({ quantity: actualTotal.minus(sale.totalCollected), unitPrice: new Big(1), item: itemModel.DISCOUNT_ID });
        }
    }

    return saleModel.insert(sale, function saleInsertCallback(err, sale) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        // We're only returning the ID to the client--it's not displayed currently.
        var newUrl = req.originalUrl + '/' + sale.id;
        return protocol.writeCreated(req, res, sale, newUrl);
    });
};
