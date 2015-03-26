/**
 * 
 */

var itemModel = require('../models/item');
var protocol = require('../lib/protocol');

exports.get = function getItem(req, res) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return protocol.writeError(400, req, res, 'Invalid ID: ' + req.params.id);
    }
    return itemModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        if (!results || 1 > results.length) {
            return protocol.writeError(404, req, res, 'No item found for item ID: ' + id);
        }
        return protocol.writeData(req, res, results[0]);
    });
};

exports.getAll = function getAllItems(req, res) {
    return itemModel.getAll(function writeGetAllResult(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        if (!results || 1 > results.length) {
            return protocol.writeError(404, req, res, 'No items found');
        }
        return protocol.writeData(req, res, results);
    }, (req.query && req.query.inactive));
};

// TODO: How to add image to new item
//PROTECTED: Admin only
exports.insert = function insertItem(req, res) {
    // Make a pristine object
    var item = itemModel.createItem(protocol.getJsonInput(req));
    // Validate input.
    if (!item) {
        return protocol.writeError(400, req, res, 'No item provided.');
    } else if (!item.name) {
        return protocol.writeError(400, req, res, 'Missing name.');
    } else if (!item.uom) {
        return protocol.writeError(400, req, res, 'Missing unit of measure.');
    } else if (!item.unitPrice) {
        // TODO: Validate is a number?
        return protocol.writeError(400, req, res, 'Missing unit price.');
    }

    return itemModel.insert(item, function itemInsertCallback(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        return protocol.writeMessage(201, req, res, 'Item ' + item.name + ' added. ID: ' + results.insertId, true);
    });
};

// TODO: Check req.files for image name
//PROTECTED: Admin or self only
exports.update = function updateItem(req, res) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return protocol.writeError(400, req, res, 'Invalid ID: ' + req.params.id);
    }
    
    // Make a pristine object
    var item = itemModel.createItem(protocol.getJsonInput(req));
    // Validate input.
    if (!item) {
        return protocol.writeError(400, req, res, 'No item provided.');
    } else if (item.id && item.id !== id) {
        return protocol.writeError(400, req, res, 'Item ID in JSON(' + item.id + ') does not match specified ID: ' + id);
    }
    
    item.id = id;
    return itemModel.update(item, function updateItemCallback(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        var success = 0 < results.affectedRows;
        return protocol.writeMessage(success ? 200 : 400, req, res, success ? 'Item ' + id + ' updated.' : 'Failed to update item: ' + id, success);
    });
};
