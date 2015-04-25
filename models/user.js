/**
 * 
 */

var factory = require('../lib/queryFactory');

/**
 * All the properties on User objects
 * @const
 */
var allProps = ['id', 'name', 'isAdmin', 'isActive', 'pwd'];

/**
 * Convenience string for the fields in the DB table.
 * @const
 */
var allFields = allProps.join();

/**
 * All of the "public" fields--leaving the password field behind.
 * @const
 */
var fields = allProps.slice(0, allProps.length - 1).join();

/**
 * @const
 */
var tableName = 'Users';

var orderBy = ' ORDER BY name';

var existsQuery = factory.makeSimpleGet('SELECT name from ' + tableName + ' WHERE ? LIMIT 1');
var getQuery = factory.makeSimpleGet('SELECT ' + fields + ' from ' + tableName + ' WHERE ?');
var getWithPasswordQuery = factory.makeSimpleGet('SELECT ' + allFields + ' from ' + tableName + ' where ? AND isActive > 0');
var getAllQuery = factory.makeSimpleGetAll('SELECT ' + fields + ' from ' + tableName + orderBy);
var getAllActiveQuery = factory.makeSimpleGetAll('SELECT ' + fields + ' from ' + tableName + ' WHERE isActive > 0' + orderBy);
var insertQuery = factory.makeSimpleInsert('INSERT INTO ' + tableName + ' SET ?');
var updateQuery = factory.makeSimpleUpdate('UPDATE ' + tableName + ' SET ? WHERE ?');

exports.get = function get(id, callback) {
    return getQuery({ id: id }, callback);
};

exports.getAll = function getAll(callback, includeInactive) {
    if (includeInactive) {
        return getAllQuery(callback);
    }
    return getAllActiveQuery(callback);
};

exports.getWithPassword = function getWithPassword(name, callback) {
    return getWithPasswordQuery({ name: name }, callback);
};

exports.insert = function insert(user, callback) {
    return insertQuery(user, callback);
};

exports.update = function update(user, callback) {
    console.log(JSON.stringify(user));
    return updateQuery({ id: user.id }, user, callback);
};

exports.exists = function exists(name, callback) {
    return existsQuery({ name: name }, callback);
};

// Create a new clean user from inbound data.
exports.createUser = factory.createCleanObjectFunction(allProps);
