var uomModel = require('../models/uom');
var ServerError = require('../lib/server-error');
var protocol = require('../www/js/protocol');

//PROTECTED: Admin only
exports.get = function getUnitOfMeasure(req, res, next) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return next(new ServerError(400, 'Invalid ID: ' + req.params.id, null));
    }
    return uomModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results || 1 > results.length) {
            return next(new ServerError(404, 'No unit of measure found for ID: ' + id, null));
        }
        return protocol.writeData(req, res, results[0]);
    });
};

//PROTECTED: Admin only
exports.getAll = function getAllUnitsOfMeasure(req, res, next) {
  return uomModel.getAll(function writeGetAllResult(err, results) {
      if (err) {
          return next(new ServerError(500, null, err));
      }
      if (!results || 1 > results.length) {
          return next(new ServerError(404, 'No units of measure found', null));
      }
      return protocol.writeData(req, res, results);
  });
};

//PROTECTED: Admin only
exports.insert = function insertUnitOfMeasure(req, res, next) {
    // Make a pristine object
    var uom = uomModel.createUnitOfMeasure(protocol.getJsonInput(req));
    
    // Validate input.
    if (!uom) {
        return next(new ServerError(400, 'No unit of measure provided.', null));
    } else if (!uom.name) {
        return next(new ServerError(400, 'No unit of measure name specified.', null));
    }
    
    return uomModel.insert(uom, function uomInsertCallback(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        var newUrl = req.originalUrl + '/' + results.insertId;
        uom.id = results.insertId;
        return protocol.writeCreated(req, res, uom, newUrl);
    });
};

//PROTECTED: Admin only
exports.update = function updateUnitOfMeasure(req, res, next) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return next(new ServerError(400, 'Invalid ID: ' + req.params.id, null));
    }
    
    // Make a pristine object
    var uom = uomModel.createUnitOfMeasure(protocol.getJsonInput(req));
    
    // Validate input.
    if (!uom) {
        return next(new ServerError(400, 'No unit of measure provided.', null));
    } else if (uom.id !== id) {
        return next(new ServerError(400, 'Unit of measure ID in JSON(' + uom.id + ') does not match specified ID: ' + id, null));
    }
    
    return uomModel.update(uom, function updateUnitOfMeasureCallback(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        var success = 0 < results.affectedRows;
        return protocol.writeMessage(success ? 200 : 400, req, res, success ? 'Unit of measure ' + id + ' updated.' : 'Failed to update unit of measure: ' + id, success);
    });
};

//PROTECTED: Admin only
exports.exists = function exists(req, res, next) {
    // Not really id in this case.
    var name = req.params.id;
    return uomModel.exists(name, function exists(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results || 1 > results.length) {
            return res.sendStatus(404);
        }
        return res.sendStatus(204);
    });
};
