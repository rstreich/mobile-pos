/**
 * Configure a multer options object.
 */
var fs = require('fs');
var path = require('path');
var multer = require('multer');
var imageMagick = require('gm').subClass({ imageMagick: true });

var protocol = require('../www/js/protocol');

module.exports = function(config) {
    var imageWidth = 150;

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
        var uploadedFile = file.path;
        var filename = file.name.replace(/\.[^/.]+$/, '.png');
        var destinationFile = path.join(imagePath, filename);
        imageMagick(uploadedFile).resize(imageWidth).write(destinationFile,
            function resizeCallback(err, stdout, stderr, command) {
                try {
                    if (err) {
                        return next(err);
                    }
                    return protocol.writeData(req, res, { image: filename });
                } finally {
                    fs.unlink(uploadedFile, function noOp() {});
                }
            });
    }

    var multerConfig = {
        putSingleFilesInArray: true, // Will be default behavior in future release
        dest: uploadPath,
        rename: renameFile
    };

    return {
        handleForm: multer(multerConfig),
        resizeFile: resizeFile
    };
};
