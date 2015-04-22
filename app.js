var express = require('express');
var path = require('path');
var favicons = require('connect-favicons');
var logger = require('morgan');
var bodyParser = require('body-parser');
var bunyan = require('bunyan');

var ServerError = require('./lib/server-error');
var protocol = require('./www/js/protocol.js');
var auth2 = require('./controllers/auth');

// All client side stuff--not fighting the angular generator
var clientRoot = path.join(__dirname, 'www');
var imageRoot = path.join(clientRoot, 'img');

// Routes
var auth = require('./routes/auth');
var users = require('./routes/users');
var locations = require('./routes/locations');
var items = require('./routes/items');
var uoms = require('./routes/uoms');
var sales = require('./routes/sales');
var images = require('./routes/images');

var log = bunyan.createLogger({
    name: 'produce',
    serializers: require('./lib/log-serializers')
});

var app = express();
app.disable('x-powered-by');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicons(path.join(imageRoot, 'icons')));
app.use(logger('dev'));

app.use(express.static(clientRoot));

app.use('/api', auth2.verifyAuthenticated);

var imageUploadConfig = {
    uploadPath: path.join(imageRoot, 'uploads'),
    imagePath: path.join(imageRoot, 'items')
};

app.use(bodyParser.json({}));
//app.use(bodyParser.urlencoded({ extended: false }));

// Map all of the routes.
app.use('/api/auth', auth);
app.use('/api/images', images(imageUploadConfig));
app.use('/api/users', users);
app.use('/api/locations', locations);
app.use('/api/items', items);
app.use('/api/uoms', uoms);
app.use('/api/sales', sales);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new ServerError(404, 'Not Found', null);
  next(err);
});

// error handlers
app.use(function jsonErrorHandler(err, req, res, next) {
    if (err.status === 404) {
        return next(err);
    }
    log.error({ req: req, err: err });
    protocol.writeError(err.status || 500, req, res, err);
});

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
