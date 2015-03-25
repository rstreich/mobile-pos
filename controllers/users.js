var bcrypt = require('bcrypt');
var userModel = require('../models/user');
var protocol = require('../lib/protocol');

//Consolidating hashing code
function hashPassword(user, dbQuery, callback) {
    bcrypt.hash(user.pwd, 8, function hashCallback(err, hash) {
        if (err) {
            return callback(err);
        } else {
            user.pwd = hash;
            return dbQuery(user, callback);
        }
    });
}

// Testing for *invalidity*--if a message is returned, it's invalid.
function isInvalidPassword(pwd) {
    if (typeof(pwd) !== "string") {
        // Coding error
        return 'Password property must be a string. Received ' + typeof(pwd);
    } else if (8 > pwd.length) {
        return 'Password must be at least 8 characters long.';
    }
    return null;
}

//PROTECTED: Admin only
exports.get = function getUser(req, res) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return protocol.writeError(400, req, res, 'Invalid ID: ' + req.params.id);
    }
    return userModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        if (!results || 1 > results.length) {
            return protocol.writeError(404, req, res, 'No user found for user ID: ' + id);
        }
        return protocol.writeData(req, res, results[0]);
    });
};

//PROTECTED: Admin only
exports.getAll = function getAllUsers(req, res) {
    return userModel.getAll(function writeGetAllResult(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        if (!results || 1 > results.length) {
            return protocol.writeError(404, req, res, 'No users found');
        }
        return protocol.writeData(req, res, results);
    }, (req.query && req.query.inactive));
};

//PROTECTED: Admin only
exports.insert = function insertUser(req, res) {
    // Make a pristine object
    var user = userModel.createUser(protocol.getJsonInput(req));
    // Validate input.
    if (!user) {
        return protocol.writeError(400, req, res, 'No user provided.');
    } else if (!user.name) {
        return protocol.writeError(400, req, res, 'No username specified.');
    } else if (!user.pwd) {
        return protocol.writeError(400, req, res, 'Missing password.');
    }
    var message = isInvalidPassword(user.pwd);
    if (message) {
        return protocol.writeError(400, req, res, message);
    }
    return hashPassword(user, userModel.insert, function userInsertCallback(err, results) {
        if (err) {
            return protocol.writeError(500, req, res, err);
        }
        return protocol.writeMessage(201, req, res, 'User ' + user.name + ' added. ID: ' + results.insertId, true);
    });
};

//PROTECTED: Admin or self only
exports.update = function updateUser(req, res) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return protocol.writeError(400, req, res, 'Invalid ID: ' + req.params.id);
    }
    
    // Make a pristine object
    var user = userModel.createUser(protocol.getJsonInput(req));
    // Validate input.
    if (!user) {
        return protocol.writeError(400, req, res, 'No user provided.');
    } else if (user.id && user.id !== id) {
        return protocol.writeError(400, req, res, 'User ID in JSON(' + user.id + ') does not match specified ID: ' + id);
    }
    user.id = id;
    
    var successMessage = 'User ' + id + ' updated.';
    var failureMessage = 'Failed to update user: ' + id;
    if (user.pwd) {
        // Password change, so validate the password.
        var message = isInvalidPassword(user.pwd);
        if (message) {
            return protocol.writeError(400, req, res, message);
        }
        return hashPassword(user, userModel.update, function updateUserPwdCallback(err, results) {
            if (err) {
                return protocol.writeError(500, req, res, err);
            }
            var success = 0 < results.affectedRows;
            return protocol.writeMessage(success ? 201 : 400, req, res, success ? successMessage : failureMessage, success);
        });
    } else {
        userModel.update(user, function updateUserCallback(err, results) {
            if (err) {
                return protocol.writeError(500, req, res, err);
            }
            var success = 0 < results.affectedRows;
            return protocol.writeMessage(success ? 200 : 400, req, res, success ? successMessage : failureMessage, success);
        });
    }
};
