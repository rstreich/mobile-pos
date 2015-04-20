var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var async = require('async');
var unless = require('express-unless');
var userModel = require('../models/user');
var ServerError = require('../lib/server-error');
var protocol = require('../www/js/protocol');

var inspect = require('util').inspect;

var audience = 'produceApi';
var issuer = 'produce';
// Total lifespan = tokenExpirationMinutes + tokenGracePeriodMinutes
var tokenExpirationMinutes = 1;
var tokenGracePeriodMinutes = 1440;

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
            return done(new ServerError(400, 'No user found for username: ' + username, null));
        }
        return bcrypt.compare(password, user.pwd, function(err, valid) {
            if (err) {
                return done(err);
            } else if (!valid){
                return done(new ServerError(400, 'Invalid password.', null));
            } else {
                return done(null, user);
            }
        });
    });
}

exports.login = function(req, res, next) {
    var data = protocol.getJsonInput(req);
    if (!data) {
        return next(new ServerError(400, 'No user provided.', null));
    }
    verifyPassword(data.username, data.password, function authenticate(err, user) {
        if (err) {
            return next(err);
        }
        var trimmedUser = { id: user.id, name: user.name, isAdmin: user.isAdmin };
        var token = jwt.sign(copyUserData(trimmedUser), secret, jwtSignConfig);
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
                return callback(new ServerError(401, 'Format is Authorization: Bearer [token]', null));
            }
        } else {
            return callback(new ServerError(401, 'Format is Authorization: Bearer [token]', null));
        }
        return callback(null, token);
    }
    return callback(new ServerError(401, 'No authorization found.', null));
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

function copyUserData(decoded) {
    return { id: decoded.id, name: decoded.name, isAdmin: decoded.isAdmin };
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
                copyUserData(decoded);
                // sign() decorates the object. Sigh.
                var token = jwt.sign(copyUserData(decoded), secret, jwtSignConfig);
                return protocol.writeData(req, res, { token: token, user: copyUserData(decoded) });
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
                req.auth = copyUserData(decoded);
                // All good. Just pass it on.
                return next();
            }
            return next(new ServerError(500, 'Failed to get authorization token.', null));
        });
    };
    middleware.unless = unless;
    return middleware;
}

exports.verifyAuthenticated = makeMiddleware().unless({ path: [/^\/api\/auth/]});

exports.verifyAdmin = function verifyAdmin(req, res, next) {
    if (req.auth && req.auth.isAdmin) {
         return next();
    } else {
         return res.sendStatus(403);
    }
};

exports.verifySelfUpdate = function verifySelfUpdate(req, res, next) {
    if (!req.auth) {
        return res.sendStatus(401);
    }
    var user = protocol.getJsonInput(req);
    if (!user) {
        return next(new ServerError(400, 'No user provided.', null));
    }
    if (req.auth.id != user.id) {
        return res.sendStatus(403);
    }
    return next();
};
