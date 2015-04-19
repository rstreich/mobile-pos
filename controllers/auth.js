var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var unless = require('express-unless');
var userModel = require('../models/user');
var protocol = require('../www/js/protocol');

var inspect = require('util').inspect;

var audience = 'produceApi';
var issuer = 'produce';
// Total lifespan = tokenExpirationMinutes + tokenGracePeriodMinutes
var tokenExpirationMinutes = 1;
var tokenGracePeriodMinutes = 30;

var secret = 'gobbledygook';

var jwtSignConfig = {
    expiresInMinutes: tokenExpirationMinutes,
    audience: audience,
    issuer: issuer,
    typ: 'JWT'
};

function verifyPassword(username, password, done) {
    userModel.getWithPassword(username, function(err, result) {
        if (err) {
            return done(err);
        }
        var user = result[0];
        if (!user) {
            var error = new Error('No user found for username: ' + username);
            error.status = 400;
            return done(error);
        }
        return bcrypt.compare(password, user.pwd, function(err, valid) {
            if (err) {
                return done(err);
            } else if (!valid){
                var error = new Error('Invalid password.');
                error.status = 400;
                return done(error);
            } else {
                return done(null, user);
            }
        });
    });
}

exports.login = function(req, res, next) {
    var data = protocol.getJsonInput(req);
    if (!data) {
        var error = new Error('No user provided.');
        error.status = 400;
        return next(error);
    }
    verifyPassword(data.username, data.password, function authenticate(err, user) {
        if (err) {
            return next(err);
        }
        var trimmedUser = { id: user.id, name: user.name, isAdmin: user.isAdmin };
        var token = jwt.sign(trimmedUser, secret, jwtSignConfig);
        protocol.writeData(req, res, { token: token, user: trimmedUser });
    });
};

exports.logout = function(req, res, next) {
    res.sendStatus(204);
};

function getToken(req, callback) {
    if (req.headers && req.headers.authorization) {
        var token = null;
        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            var scheme = parts[0];
            var credentials = parts[1];
            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            } else {
                var badSchemeError = new Error('Format is Authorization: Bearer [token]');
                badSchemeError.status = 401;
                return callback(badSchemeError);
            }
        } else {
            var badFormatError = new Error('Format is "Authorization: Bearer [token]"');
            badFormatError.status = 401;
            return callback(badFormatError);
        }
        return callback(null, token);
    }
    var noAuthError = new Error('No authorization found.');
    noAuthError.status = 401;
    return callback(noAuthError);
}

function verifyToken(token, callback) {
    jwt.verify(token, secret, { audience: audience, issuer: issuer }, function(err, decoded) {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return callback(null, jwt.decode(token), true);
            }
            return callback(err);
        }
        return callback(null, decoded);
    });
}

function withinGracePeriod(expirationDateInSeconds) {
    return Date.now() < ((expirationDateInSeconds * 1000) + (tokenGracePeriodMinutes * 60000))
}

function getUserFromToken(decoded) {
    return {id: decoded.id, name: decoded.name, isAdmin: decoded.isAdmin};
}

/*
 * A way for the client to test if its token is still valid. If it got here, it is.
 */
exports.ping = function(req, res, next) {
    async.waterfall([
        function start(callback) {
            // Just to get the request on the closure.
            return callback(null, req);
        },
        getToken,
        verifyToken
    ],
    function pingDone(err, decoded, isExpired) {
        if (err) {
            return next(err);
        }
        if (decoded && isExpired) {
            // Are we in the grace period?
            if (withinGracePeriod(decoded.exp)) {
                var user = getUserFromToken(decoded);
                var token = jwt.sign(user, secret, jwtSignConfig);
                return protocol.writeData(req, res, { token: token, user: user });
            }
            return res.sendStatus(401);
        }
        return res.sendStatus(204);
    });
};

function makeMiddleware() {
    var middleware = function verifyAuthenticated(req, res, next) {
        async.waterfall([
            function start(callback) {
                // Just to get the request on the closure.
                return callback(null, req);
            },
            getToken,
            verifyToken
        ],
        function verifyDone(err, decoded, isExpired) {
            if (err) {
                return next(err);
            }
            if (decoded) {
                if (isExpired) {
                    if (withinGracePeriod(decoded.exp)) {
                        // The client can come back with a ping to get a fresh token.
                        return res.sendStatus(419);
                    }
                    return res.sendStatus(401);
                }
                // Attach the user to the request.
                req.auth = getUserFromToken(decoded);
                // All good. Just pass it on.
                return next();
            }
            return next(new Error('Failed to get authorization token.'));
        });
    };
    middleware.unless = unless;
    return middleware;
}

exports.verifyAuthenticated = makeMiddleware().unless({ path: [/^\/api\/auth/]});

//TODO: Stubs for now.
var passThrough = function passThrough(req, res, next) {
    next();
};

//exports.verifyAuthenticated = passThrough;
exports.verifySelfUpdate = passThrough;

exports.verifyAdmin = function verifyAdmin(req, res, next) {
    if (req.auth && req.auth.isAdmin) {
         return next();
    } else {
         return res.send(403);
    }
};

//exports.verifySelfUpdate = function verifySelfUpdate(req, res, next) {
// var targetUsername = req.params || req.params.name || '#########';
// if (targetUsername === req.user.name) {
//     return next();
// } else {
//     return res.send(403);
// }
//};
