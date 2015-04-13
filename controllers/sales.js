/**
 * 
 */

var saleModel = require('../models/sale');
var itemModel = require('../models/item');
var protocol = require('../www/js/protocol');
var Big = require('big.js');
var inspect = require('util').inspect;

exports.get = function getSale(req, res) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return protocol.writeError(400, req, res, 'Invalid ID: ' + req.params.id);
    }
    return saleModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        if (!results) {
            return protocol.writeError(404, req, res, 'No sale found for sale ID: ' + id);
        }
        return protocol.writeData(req, res, results);
    });
};

exports.insert = function insertSale(req, res) {
    // Make a pristine object
    var sale = saleModel.createSale(protocol.getJsonInput(req));
    // Validate input.
    if (!sale) {
        return protocol.writeError(400, req, res, 'No sale provided.');
    } else if (!sale.location) {
        return protocol.writeError(400, req, res, 'Missing location.');
    } else if (!sale.soldBy) {
        return protocol.writeError(400, req, res, 'Missing sold by.');
    } else if (!sale.totalCollected) {
        // TODO: Validate is a number?
        return protocol.writeError(400, req, res, 'Missing total price.');
    } else if (!sale.soldItems) {
        return protocol.writeError(400, req, res, 'Missing list of items sold.');
    } else {
        var actualTotal = new Big(0);
        // We know it's either null or an array.
        for (var i = 0; i < sale.soldItems.length; ++i) {
            var soldItem = sale.soldItems[i];
            if (!soldItem.quantity) {
                return protocol.writeError(400, req, res, 'Missing quantity.');
            } else if (!soldItem.unitPrice) {
                return protocol.writeError(400, req, res, 'Missing unit price.');
            } else if (!soldItem.item) {
                return protocol.writeError(400, req, res, 'Missing item.');
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
            return protocol.writeError(500, req, res, err);
        }
        // We're only returning the ID to the client--it's not displayed currently.
        var newUrl = req.originalUrl + '/' + sale.id;
        return protocol.writeCreated(req, res, sale, newUrl);
    });
};
