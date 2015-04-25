var bcrypt = require('bcrypt');
var userModel = require('../models/user');
var ServerError = require('../lib/server-error');
var protocol = require('../www/js/protocol');

// Consolidating hashing code
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
exports.get = function getUser(req, res, next) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return next(new ServerError(400, 'Invalid ID: ' + req.params.id, null));
    }
    return userModel.get(id, function writeGetResult(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results || 1 > results.length) {
            return next(new ServerError(404, 'No user found for user ID: ' + id, null));
        }
        return protocol.writeData(req, res, results[0]);
    });
};

//PROTECTED: Admin only
exports.getAll = function getAllUsers(req, res, next) {
    return userModel.getAll(function writeGetAllResult(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results || 1 > results.length) {
            return next(new ServerError(404, 'No users found', null));
        }
        return protocol.writeData(req, res, results);
    }, (req.query && req.query.inactive));
};

//PROTECTED: Admin only
exports.insert = function insertUser(req, res, next) {
    // Make a pristine object
    var user = userModel.createUser(protocol.getJsonInput(req));
    // Validate input.
    if (!user) {
        return next(new ServerError(400, 'No user provided.', null));
    } else if (!user.name) {
        return next(new ServerError(400, 'No username specified.', null));
    } else if (!user.pwd) {
        return next(new ServerError(400, 'Missing password.', null));
    }
    var message = isInvalidPassword(user.pwd);
    if (message) {
        return next(new ServerError(400, message, null));
    }
    return hashPassword(user, userModel.insert, function userInsertCallback(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        var newUrl = req.originalUrl + '/' + results.insertId;
        user.id = results.insertId;
        delete user.pwd;
        return protocol.writeCreated(req, res, user, newUrl);
    });
};

//PROTECTED: Admin or self only
exports.update = function updateUser(req, res, next) {
    var id = Number(req.params.id);
    if (Number.isNaN(id)) {
        return next(new ServerError(400, 'Invalid ID: ' + req.params.id, null));
    }
    
    // Make a pristine object
    var user = userModel.createUser(protocol.getJsonInput(req));
    // Validate input.
    if (!user) {
        return next(new ServerError(400, 'No user provided.', null));
    } else if (user.id !== id) {
        return next(new ServerError(400, 'User ID in JSON(' + user.id + ') does not match specified ID: ' + id, null));
    }

    var successMessage = 'User ' + id + ' updated.';
    var failureMessage = 'Failed to update user: ' + id;
    if (user.pwd) {
        // Password change, so validate the password.
        var message = isInvalidPassword(user.pwd);
        if (message) {
            return next(new ServerError(400, message, null));
        }
        return hashPassword(user, userModel.update, function updateUserPwdCallback(err, results) {
            if (err) {
                return next(new ServerError(500, null, err));
            }
            if (1 > results.affectedRows) {
                return next(new ServerError(400, failureMessage, null));
            }
            return protocol.writeMessage(200, req, res, successMessage);
        });
    } else {
        userModel.update(user, function updateUserCallback(err, results) {
            if (err) {
                return next(new ServerError(500, err, null));
            }
            if (1 > results.affectedRows) {
                return next(new ServerError(400, failureMessage, null));
            }
            return protocol.writeMessage(200, req, res, successMessage);
        });
    }
};

//PROTECTED: Admin only
exports.exists = function exists(req, res, next) {
    // Not really id in this case.
    var name = req.params.id;
    return userModel.exists(name, function exists(err, results) {
        if (err) {
            return next(new ServerError(500, null, err));
        }
        if (!results || 1 > results.length) {
            return res.sendStatus(404);
        }
        return res.sendStatus(204);
    });
};
