var passport = require('passport');
var LocalStrategy = require('passport-local');
var bcrypt = require('bcrypt');
var userModel = require('../models/user');
var protocol = require('../www/js/protocol');

passport.use(new LocalStrategy(function(name, password, done) {
    userModel.getWithPassword(name, function(err, user) {
        if (err) {
            return done(err);
        } else if (!user) {
            return done(null, false, { message: 'No user found for username: ' + user.name });
        } else {
            return bcrypt.compare(password, user.pwd, function(err, valid) {
                if (err) {
                    return done(err);
                } else if (!valid){
                    return done(null, false, { message: 'Invalid password.' });
                } else {
                    return done(null, user);
                }
            });
        }
    });
}));


//TODO: Stubs for now.
var passThrough = function passThrough(req, res, next) {
 next();
};

exports.verifyAuthenticated = passThrough;
exports.verifyAdmin = passThrough;
exports.verifySelfUpdate = passThrough;

//exports.verifyAuthenticated = passport.authenticate('local');
//
//exports.verifyAdmin = function verifyAdmin(req, res, next) {
// if (req.user && req.user.isAdmin) {
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

exports.login = passport.authenticate('local');

// TODO: Tighten this up.
exports.loginSuccess = function(req, res) {
    protocol.writeData(req, res, req.user);
};

//TODO: ??? Useful?
//exports.login = function login(user, req, res, callback) {
// req.login(user, function(err) {
//     if (err) {
//         return callback(err);
//     }
//     return res.redirect('/users/' + req.user.username);
// });
//};

exports.logout = function logout(req, res) {
 req.logout();
 res.redirect('/');
};
