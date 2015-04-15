/**
 * Configure a multer options object.
 */
var express = require('express');
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var protocol = require('../www/js/protocol');
var auth = require('../controllers/auth');

// TODO: Get the bulk of the code into a controller.
module.exports = function(config) {
    // Defaults
    var uploadPath = '/uploads';
    var imagePath = '/images';
    if (config) {
        uploadPath = config.uploadPath || uploadPath;
        imagePath = config.imagePath || imagePath;
    }

    // multer API function
    function renameFile(fieldname, filename, req, res) {
        // TODO: Username is available on body.
        return '' + Date.now() + filename.replace(/\W+/g, '-').toLowerCase();
    }

    function resizeFile(req, res, next) {
        var file = req.files.file[0];

        // TODO: Moving file is temporary. Image resize should happen here.
        var uploadedFile = file.path;
        var destinationFile = path.join(imagePath, file.name);
        fs.rename(uploadedFile, destinationFile,
            function returnFilename(err) {
                if (err) {
                    fs.unlink(uploadedFile, function noOp() {});
                    return next(err);
                }
                return protocol.writeData(req, res, { image: file.name });
            });
    }

    var multerConfig = {
        putSingleFilesInArray: true, // Will be default behavior in future release
        dest: uploadPath,
        rename: renameFile
    };

    var router = express.Router();
    var root = router.route('/');
    root.post(auth.verifyAdmin, multer(multerConfig), resizeFile);
    return router;
};
