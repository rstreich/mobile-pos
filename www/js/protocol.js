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
        if (data.apiVersion) {  // On token refresh/retries, we hit here twice.
            return data;
        }
        var obj = new JsonObject(config.url);
        obj.data = data;
        return obj;
    };

    // Client-side:
    exports.unWrap = function unWrap(responseData) {
        // TODO: Serious rethink needed here. Look at discards in protocol interceptor. Really unhappy.
        if (!responseData) {
            return null;
        }
        if (responseData.apiVersion) {
            return { data: responseData.data || null, message: responseData.message || null, error: responseData.error || null };
        } else { // On token refresh/retries, we hit here twice.
            return { data: responseData };
        }
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
    exports.writeMessage = function writeJsonMessage(code, req, res, message) {
        var ret = new JsonObject(req.originalUrl);
        ret.message = message;
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
    // TODO: Get code from error object.
    exports.writeError = function writeJsonError(code, req, res, err) {
        var ret = new JsonObject(req.originalUrl);
        // TODO: stack always?
        ret.error = { status: err.status || 500, message: err.message, stack: err.stack };
        res.status(code);
        res.json(ret);
    };
})(typeof exports === 'undefined' ? this['protocol'] = {} : exports);