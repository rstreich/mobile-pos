var express = require('express');

var auth = require('../lib/auth');
var imageUpload = require('../lib/image-upload');

module.exports = function configureUploader(imageConfig) {
    var imageUploader = imageUpload(imageConfig);
    var router = express.Router();
    router.route('/').post(auth.verifyAdmin, imageUploader.handleForm, imageUploader.resizeFile);
    return router;
};
