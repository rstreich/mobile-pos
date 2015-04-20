var serializers = {};

serializers.err = function(err) {
    if (!err || !err.stack) {
        return err;
    }
    return {
        message: err.message,
        name: err.name,
        stack: err.stack || err.toString(),
        status: err.status
    };
};

serializers.req = function req(req) {
    if (!req || !req.connection) {
        return req;
    }

    return {
        method: req.method,
        url: req.url,
        headers: req.headers,
        data: req.body ? req.body.data : null,
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort
    };
};

module.exports = serializers;