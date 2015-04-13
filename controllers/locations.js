var locationModel = require('../models/location');
var protocol = require('../www/js/protocol');

//PROTECTED: Admin only
exports.get = function getLocation(req, res) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return protocol.writeError(400, req, res, 'Invalid ID: ' + req.params.id);
    }
    return locationModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        if (!results || 1 > results.length) {
            return protocol.writeError(404, req, res, 'No location found for location ID: ' + id);
        }
        return protocol.writeData(req, res, results[0]);
    });
};

//PROTECTED: Admin only
exports.getAll = function getAllLocations(req, res) {
  return locationModel.getAll(function writeGetAllResult(err, results) {
      if (err) {
          return protocol.writeError(500, req, res, err);
      }
      if (!results || 1 > results.length) {
          return protocol.writeError(404, req, res, 'No locations found');
      }
      return protocol.writeData(req, res, results);
  });
};

//PROTECTED: Admin only
exports.insert = function insertLocation(req, res) {
    // Make a pristine object
    var location = locationModel.createLocation(protocol.getJsonInput(req));
    
    // Validate input.
    if (!location) {
        return protocol.writeError(400, req, res, 'No location provided.');
    } else if (!location.name) {
        return protocol.writeError(400, req, res, 'No location name specified.');
    }
    
    return locationModel.insert(location, function locationInsertCallback(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        var newUrl = req.originalUrl + '/' + results.insertId;
        location.id = results.insertId;
        return protocol.writeCreated(req, res, location, newUrl);
    });
};

//PROTECTED: Admin only
exports.update = function updateLocation(req, res) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return protocol.writeError(400, req, res, 'Invalid ID: ' + req.params.id);
    }
    
    // Make a pristine object
    var location = locationModel.createLocation(protocol.getJsonInput(req));
    
    // Validate input.
    if (!location) {
        return protocol.writeError(400, req, res, 'No location provided.');
    } else if (location.id !== id) {
        return protocol.writeError(400, req, res, 'Location ID in JSON(' + location.id + ') does not match specified ID: ' + id);
    }
    
    return locationModel.update(location, function updateLocationCallback(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        var success = 0 < results.affectedRows;
        return protocol.writeMessage(success ? 200 : 400, req, res, success ? 'Location ' + id + ' updated.' : 'Failed to update location: ' + id, success);
    });
};
