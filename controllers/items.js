/**
 * 
 */

var itemModel = require('../models/item');
var ServerError = require('../lib/server-error');
var protocol = require('../www/js/protocol');

exports.get = function getItem(req, res, next) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return next(new ServerError(400, 'Invalid ID: ' + req.params.id, null));
    }
    return itemModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results || 1 > results.length) {
            return next(new ServerError(404, 'No item found for item ID: ' + id, null));
        }
        return protocol.writeData(req, res, results[0]);
    });
};

exports.getAll = function getAllItems(req, res, next) {
    return itemModel.getAll(function writeGetAllResult(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results || 1 > results.length) {
            return next(new ServerError(404, 'No items found', null));
        }
        return protocol.writeData(req, res, results);
    }, (req.query && req.query.inactive));
};

//PROTECTED: Admin only
exports.insert = function insertItem(req, res, next) {
    // Make a pristine object
    var inboundItem = protocol.getJsonInput(req);
    var item = itemModel.createItem(inboundItem);
    // Validate input.
    if (!item) {
        return next(new ServerError(400, 'No item provided.', null));
    } else if (!item.name) {
        return next(new ServerError(400, 'Missing name.', null));
    } else if (!item.uom) {
        return next(new ServerError(400, 'Missing unit of measure.', null));
    } else if (!item.unitPrice) {
        return next(new ServerError(400, 'Missing unit price.', null));
    }

    return itemModel.insert(item, function itemInsertCallback(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        var newUrl = req.originalUrl + '/' + results.insertId;
        item.id = results.insertId;
        item.uom = inboundItem.uom; // Restore the complete object at uom
        return protocol.writeCreated(req, res, item, newUrl);
    });
};

//PROTECTED: Admin or self only
exports.update = function updateItem(req, res, next) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return next(new ServerError(400, 'Invalid ID: ' + req.params.id, null));
    }
    
    // Make a pristine object
    var item = itemModel.createItem(protocol.getJsonInput(req));
    // Validate input.
    if (!item) {
        return next(new ServerError(400, 'No item provided.', null));
    } else if (item.id !== id) {
        return next(new ServerError(400, 'Item ID in JSON(' + item.id + ') does not match specified ID: ' + id, null));
    }
    
    return itemModel.update(item, function updateItemCallback(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        var success = 0 < results.affectedRows;
        return protocol.writeMessage(success ? 200 : 400, req, res, success ? 'Item ' + id + ' updated.' : 'Failed to update item: ' + id, success);
    });
};

//PROTECTED: Admin only
exports.exists = function exists(req, res, next) {
    // Not really id in this case.
    var name = req.params.id;
    return itemModel.exists(name, function exists(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results || 1 > results.length) {
            return res.sendStatus(404);
        }
        return res.sendStatus(204);
    });
};
