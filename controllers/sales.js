/**
 * 
 */

var saleModel = require('../models/sale');
var itemModel = require('../models/item');
var protocol = require('../lib/protocol');

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
    } else if (!sale.totalPrice) {
        // TODO: Validate is a number?
        return protocol.writeError(400, req, res, 'Missing total price.');
    } else if (!sale.soldItems) {
        return protocol.writeError(400, req, res, 'Missing list of items sold.');
    } else {
        var actualTotal = 0;
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
            actualTotal += (soldItem.quantity * soldItem.unitPrice);
        }
        
        // Make up for discrepancies between real price and tendered price, if any.
        if (actualTotal < sale.totalPrice) {
            // Add a donation item.
            sale.soldItems.push({ quantity: sale.totalPrice - actualTotal, unitPrice: 1, item: itemModel.DONATION_ID });
        } else if (actualTotal > sale.totalPrice) {
            // Add a discount item
            sale.soldItems.push({ quantity: actualTotal - sale.totalPrice, unitPrice: 1, item: itemModel.DISCOUNT_ID });
        }
    }

    return saleModel.insert(sale, function saleInsertCallback(err, saleId) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        return protocol.writeMessage(201, req, res, 'Sale ' + saleId + ' added.', true);
    });
};
