var express = require('express');
var path = require('path');
var favicons = require('connect-favicons');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var multer = require('multer');

// All client side stuff--not fighting the angular generator
var clientRoot = path.join(__dirname, 'www');
var imageRoot = path.join(clientRoot, 'img');

// Routes
var users = require('./routes/users');
var locations = require('./routes/locations');
var items = require('./routes/items');
var uoms = require('./routes/uoms');
var sales = require('./routes/sales');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicons(path.join(imageRoot, 'icons')));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
    putSingleFilesInArray: true, // Will be default behavior in future release
    dest: path.join(imageRoot, 'items'),
    rename: function (fieldname, filename, req, res) {
        return filename + Date.now()
    },
    onFileUploadComplete: function (file, req, res) {
        // Use this to trigger update of item view?
    }
    }));
app.use(cookieParser());
app.use(session({ secret: 'some gobbledygook', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(clientRoot));
//app.use(express.static(path.join(__dirname, 'bower_components')));

app.use('/users', users);
app.use('/locations', locations);
app.use('/items', items);
app.use('/uoms', uoms);
app.use('/sales', sales);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
