var uomModel = require('../models/uom');
var protocol = require('../www/js/protocol');

//PROTECTED: Admin only
exports.get = function getUnitOfMeasure(req, res) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return protocol.writeError(400, req, res, 'Invalid ID: ' + req.params.id);
    }
    return uomModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        if (!results || 1 > results.length) {
            return protocol.writeError(404, req, res, 'No unit of measure found for ID: ' + id);
        }
        return protocol.writeData(req, res, results[0]);
    });
};

//PROTECTED: Admin only
exports.getAll = function getAllUnitsOfMeasure(req, res) {
  return uomModel.getAll(function writeGetAllResult(err, results) {
      if (err) {
          return protocol.writeError(500, req, res, err);
      }
      if (!results || 1 > results.length) {
          return protocol.writeError(404, req, res, 'No units of measure found');
      }
      return protocol.writeData(req, res, results);
  });
};

//PROTECTED: Admin only
exports.insert = function insertUnitOfMeasure(req, res) {
    // Make a pristine object
    var uom = uomModel.createUnitOfMeasure(protocol.getJsonInput(req));
    
    // Validate input.
    if (!uom) {
        return protocol.writeError(400, req, res, 'No unit of measure provided.');
    } else if (!uom.name) {
        return protocol.writeError(400, req, res, 'No unit of measure name specified.');
    }
    
    return uomModel.insert(uom, function uomInsertCallback(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        var newUrl = req.originalUrl + '/' + results.insertId;
        uom.id = results.insertId;
        return protocol.writeCreated(req, res, uom, newUrl);
    });
};

//PROTECTED: Admin only
exports.update = function updateUnitOfMeasure(req, res) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return protocol.writeError(400, req, res, 'Invalid ID: ' + req.params.id);
    }
    
    // Make a pristine object
    var uom = uomModel.createUnitOfMeasure(protocol.getJsonInput(req));
    
    // Validate input.
    if (!uom) {
        return protocol.writeError(400, req, res, 'No unit of measure provided.');
    } else if (uom.id !== id) {
        return protocol.writeError(400, req, res, 'Unit of measure ID in JSON(' + uom.id + ') does not match specified ID: ' + id);
    }
    
    return uomModel.update(uom, function updateUnitOfMeasureCallback(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        var success = 0 < results.affectedRows;
        return protocol.writeMessage(success ? 200 : 400, req, res, success ? 'Unit of measure ' + id + ' updated.' : 'Failed to update unit of measure: ' + id, success);
    });
};
