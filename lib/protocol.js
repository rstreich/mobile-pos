var express = require('express');
var inspect = require('util').inspect;

function JsonObject(req) {
    this.apiVersion = '0.1';
    this.originalUrl = req.originalUrl;
}

// Future use function for verifying compatibility, etc. Just get the data object for now.
exports.getJsonInput = function getJsonInput(req) {
    if (req.hasOwnProperty('body') && req.body.hasOwnProperty('data')) {
        return req.body.data;
    }
    return null;
};

/**
 * 
 */
exports.writeData = function writeJsonData(req, res, obj) {
    var ret = new JsonObject(req);
    ret.data = obj;
    res.status(200);
    res.json(ret);
};

/**
 * 
 */
exports.writeMessage = function writeJsonMessage(code, req, res, message, success) {
    var ret = new JsonObject(req);
    ret.message = message;
    ret.success = success;
    // TODO: protect with type check
    res.status(code);
    res.json(ret);
};

/**
 * 
 */
exports.writeError = function writeJsonError(code, req, res, err) {
    var ret = new JsonObject(req);
    ret.error = err;
    // TODO: protect with type check
    res.status(code);
    res.json(ret);
};