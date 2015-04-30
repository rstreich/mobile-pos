var express = require('express');
var path = require('path');
var favicons = require('connect-favicons');
var logger = require('morgan');
var bodyParser = require('body-parser');
var bunyan = require('bunyan');
// TODO: Get rid of Morgan?

var ServerError = require('./lib/errors').ServerError;
var NotFoundError = require('./lib/errors').NotFoundError;
var addHeaders = require('./lib/headers');
var protocol = require('./www/js/protocol.js');
var auth = require('./lib/auth');

// All client side stuff--not fighting the ionic generator
var clientRoot = path.join(__dirname, 'www');
var imageRoot = path.join(clientRoot, 'img');

// TODO: Write log to file.
var log = bunyan.createLogger({
    name: 'produce',
    serializers: require('./lib/log-serializers')
});

var app = express();
app.disable('x-powered-by');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Favorites icons
app.use(favicons(path.join(imageRoot, 'icons')));
app.use(logger('dev'));

// Miscellaneous headers
app.use(addHeaders);

// Guard any access to the REST API
app.use('/api', auth.verifyAuthenticated);
app.use(express.static(clientRoot));

app.use(bodyParser.json({}));

var imageUploadConfig = {
    uploadPath: path.join(imageRoot, 'uploads'),
    imagePath: path.join(imageRoot, 'items')
};

// Map all of the API routes.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/images', require('./routes/images')(imageUploadConfig));
app.use('/api/users', require('./routes/users'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/items', require('./routes/items'));
app.use('/api/uoms', require('./routes/uoms'));
app.use('/api/sales', require('./routes/sales'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new NotFoundError('Not Found');
  next(err);
});

// error handlers
app.use(function jsonErrorHandler(err, req, res, next) {
    if (!(err instanceof ServerError)) {
        return next(err);
    }
    log.error({ req: req, err: err });
    protocol.writeError(err.status, req, res, err);
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
