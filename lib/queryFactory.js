var mysql = require('mysql');

// Create a connection pool with
// a max of 10 connections, a min of 1, and a 10-minute max idle time
var dbpool = mysql.createPool(require('./dbconfig'));

/**
 * @constructor
 */
function QueryFactory(dbpool) {
    this.pool = dbpool;
}

/**
 * Make a get query function with the specified query string.
 * 
 * @param query
 * @returns {function(object, function)}
 */
QueryFactory.prototype.makeSimpleGet = function makeSimpleGet(query) {
    var pool = this.pool;
    return function get(keyobj, callback) {
        pool.getConnection(function(err, c) {
            if (err) {
                callback(err);
            } else {
                c.query(query, keyobj, function(err, results, fields) {
                     if (err) {
                         callback(err);
                     } else {
                         callback(null, results);
                         console.log('Get finished successfully');
                     }
                });
                c.release();
            }
        });
    };
};

/**
 * Make a get all query function with the specified query string.
 * 
 * @param query
 * @returns {function(function)}
 */
QueryFactory.prototype.makeSimpleGetAll = function makeSimpleGetAll(query) {
    var pool = this.pool;
    return function get(callback) {
        pool.getConnection(function(err, c) {
            if (err) {
                callback(err);
            } else {
                c.query(query, function(err, results, fields) {
                     if (err) {
                         callback(err);
                     } else {
                         callback(null, results);
                         console.log('Get all finished successfully');
                     }
                });
                c.release();
            }
        });
    };
};

/**
 * Make an insert query function with the specified query string.
 * 
 * @param query
 * @returns {function(object, function)}
 */
QueryFactory.prototype.makeSimpleInsert = function makeSimpleInsert(query) {
    var pool = this.pool;
    return function insert(obj, callback) {
        pool.getConnection(function(err, c) {
            if (err) {
                callback(err);
            } else {
                c.query(query, obj, function(err, results, fields) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                        console.log('Insert finished successfully');
                    }
                });
                c.release();
            }
        });
    };
};

/**
 * Make an update query function with the specified query string.
 * 
 * @param query
 * @returns {function(object, function)}
 */
QueryFactory.prototype.makeSimpleUpdate = function makeSimpleUpdate(query) {
    var pool = this.pool;
    return function update(keyobj, obj, callback) {
        pool.getConnection(function(err, c) {
            if (err) {
                callback(err);
            } else {
                c.query(query, [obj, keyobj], function(err, results, fields) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                        console.log('Update finished successfully');
                    }
                });
                c.release();
            }
        });
    };
};

/**
 * Makes a function to empty a database table. Intended to be used only for test clean up.
 *
 * @param tableName
 * @returns {function(function)}
 */
QueryFactory.prototype.makeDeleteAll = function makeDeleteAll(tableName) {
    var pool = this.pool;
    var query = 'TRUNCATE ' + tableName;
    return function deleteAll(callback) {
        pool.getConnection(function(err, c) {
            if (err) {
                callback(err);
            } else {
                c.query(query, function(err, results, fields) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                        console.log('Delete all finished successfully');
                    }
                });
                c.release();
            }
        });
    };
};

/**
 * 
 * @param props
 * @returns {function(object)}
 */
// TODO: Add type validation here?
QueryFactory.prototype.createCleanObjectFunction = function createCleanObjectFunction(props) {
    return function createCleanObject(originalObj) {
        if (!originalObj) {
            return null;
        }
        var cleanObj = {};
        for (var i = 0; i < props.length; ++i) {
            if (originalObj.hasOwnProperty([props[i]])) {
                cleanObj[props[i]] = originalObj[props[i]];
            }
        }
        return cleanObj;
    };
};

QueryFactory.prototype.drain = function drain() {
    this.pool.end(function(err) {
        // TODO: Something better?
        if (err) {
            console.log(err);
        } else {
            console.log('DB pool shut down.');
        }
    });
};

module.exports = new QueryFactory(dbpool);