var locationModel = require('../models/location');
var ServerError = require('../lib/server-error');
var protocol = require('../www/js/protocol');

//PROTECTED: Admin only
exports.get = function getLocation(req, res, next) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return next(new ServerError(400, 'Invalid ID: ' + req.params.id, null));
    }
    return locationModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results || 1 > results.length) {
            return next(new ServerError(404, 'No location found for location ID: ' + id, null));
        }
        return protocol.writeData(req, res, results[0]);
    });
};

//PROTECTED: Admin only
exports.getAll = function getAllLocations(req, res, next) {
  return locationModel.getAll(function writeGetAllResult(err, results) {
      if (err) {
          return next(new ServerError(500, null, err));
      }
      if (!results || 1 > results.length) {
          return next(new ServerError(404, 'No locations found', null));
      }
      return protocol.writeData(req, res, results);
  });
};

//PROTECTED: Admin only
exports.insert = function insertLocation(req, res, next) {
    // Make a pristine object
    var location = locationModel.createLocation(protocol.getJsonInput(req));
    
    // Validate input.
    if (!location) {
        return next(new ServerError(400, 'No location provided.', null));
    } else if (!location.name) {
        return next(new ServerError(400, 'No location name specified.', null));
    }
    
    return locationModel.insert(location, function locationInsertCallback(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        var newUrl = req.originalUrl + '/' + results.insertId;
        location.id = results.insertId;
        return protocol.writeCreated(req, res, location, newUrl);
    });
};

//PROTECTED: Admin only
exports.update = function updateLocation(req, res, next) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return next(new ServerError(400, 'Invalid ID: ' + req.params.id, null));
    }
    
    // Make a pristine object
    var location = locationModel.createLocation(protocol.getJsonInput(req));
    
    // Validate input.
    if (!location) {
        return next(new ServerError(400, 'No location provided.', null));
    } else if (location.id !== id) {
        return next(new ServerError(400, 'Location ID in JSON(' + location.id + ') does not match specified ID: ' + id, null));
    }
    
    return locationModel.update(location, function updateLocationCallback(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (1 > results.affectedRows) {
            return next(new ServerError(400, 'Failed to update location: ' + id, null));
        }
        return protocol.writeMessage(200, req, res, 'Location ' + id + ' updated.');
    });
};
