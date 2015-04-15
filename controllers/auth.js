var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var userModel = require('../models/user');
var protocol = require('../www/js/protocol');

var audience = 'produceApi';
var issuer = 'produce';

var secret = 'gobbledygook';

var jwtConfig = {
    secret: secret,
    requestProperty: 'auth',
    audience: audience,
    issuer: issuer
};

function verifyPassword(username, password, done) {
    userModel.getWithPassword(username, function(err, result) {
        if (err) {
            return done(err);
        }
        var user = result[0];
        if (!user) {
            return done(null, false, 'No user found for username: ' + username);
        }
        return bcrypt.compare(password, user.pwd, function(err, valid) {
            if (err) {
                return done(err);
            } else if (!valid){
                return done(null, false, 'Invalid password.');
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
    verifyPassword(data.username, data.password, function authenticate(err, user, message) {
        if (err) {
            return next(err);
        }
        if (!user) {
            var error = new Error(message);
            error.status = 400;
            return next(error);
        }
        var trimmedUser = { id: user.id, name: user.name, isAdmin: user.isAdmin };
        var token = jwt.sign(trimmedUser, secret,
            {// TODO: expire token in 'x', refresh it if still within 'y'.
                expiresInMinutes: 1200,
                audience: audience,
                subject: user.name,
                issuer: issuer
            });
        protocol.writeData(req, res, { token: token, user: trimmedUser });
    });
};

exports.logout = function(req, res, next) {
    res.sendStatus(204);
};

//exports.verifyAuthenticated = expressJwt(jwtConfig).unless({ path: ['/login', '/logout']});

//TODO: Stubs for now.
var passThrough = function passThrough(req, res, next) {
    next();
};

exports.verifyAuthenticated = passThrough;
exports.verifyAdmin = passThrough;
exports.verifySelfUpdate = passThrough;

//exports.verifyAdmin = function verifyAdmin(req, res, next) {
// if (req.auth && req.auth.isAdmin) {
//     return next();
// } else {
//     return res.send(403);
// }
//};
//
//exports.verifySelfUpdate = function verifySelfUpdate(req, res, next) {
// var targetUsername = req.params || req.params.name || '#########';
// if (targetUsername === req.user.name) {
//     return next();
// } else {
//     return res.send(403);
// }
//};
