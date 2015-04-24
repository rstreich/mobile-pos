function noCache(res) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
}

function hsts(res) {
    res.header('Strict-Transport-Security', 'max-age=31536000');
}

function addHeaders(req, res, next) {
    noCache(res);
    hsts(res);
}

module.exports = addHeaders;