(function(exports) {

    /**
     *
     * @param url
     * @constructor
     */
    function JsonObject(url) {
        this.apiVersion = '0.1';
        this.originalUrl = url;
    }

    // Client-side:
    exports.wrap = function wrap(config, data) {
        var obj = new JsonObject(config.url);
        obj.data = data;
        return obj;
    };

    // Client-side:
    exports.unWrap = function unWrap(data) {
        if (!data) {
            return null;
        }
        // TODO: Add success value
        return { data: data.data || null, message: data.message || null, error: data.error || null };
    };

    // Future use function for verifying compatibility, etc. Just get the data object for now.
    exports.getJsonInput = function getJsonInput(req) {
        if (req.body && req.body.data) {
            return req.body.data;
        }
        return null;
    };

    /**
     *
     */
    exports.writeData = function writeJsonData(req, res, obj) {
        var ret = new JsonObject(req.originalUrl);
        ret.data = obj;
        res.status(200);
        res.json(ret);
    };

    /**
     *
     */
    exports.writeMessage = function writeJsonMessage(code, req, res, message, success) {
        var ret = new JsonObject(req.originalUrl);
        ret.message = message;
        ret.success = success;
        // TODO: protect with type check
        res.status(code);
        res.json(ret);
    };

    /**
     *
     */
    exports.writeCreated = function writeJsonMessage(req, res, obj, url) {
        var ret = new JsonObject(req.originalUrl);
        ret.data = obj;
        res.status(201);
        res.location(url);
        res.json(ret);
    };

    /**
     *
     */
    exports.writeError = function writeJsonError(code, req, res, err) {
        var ret = new JsonObject(req.originalUrl);
        ret.error = err;
        // TODO: protect with type check
        res.status(code);
        res.json(ret);
    };
})(typeof exports === 'undefined' ? this['protocol'] = {} : exports);