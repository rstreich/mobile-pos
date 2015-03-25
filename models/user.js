/**
 * 
 */

var factory = require('../lib/queryFactory');

// TODO: MAYBE--Add optimistic locking.

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

var existsQuery = factory.makeSimpleGet('SELECT name from ' + tableName + ' FORCE INDEX WHERE ? LIMIT 1');
var getQuery = factory.makeSimpleGet('SELECT ' + fields + ' from ' + tableName + ' WHERE ?');
var getPasswordQuery = factory.makeSimpleGet('SELECT ' + allFields + ' from ' + tableName + ' where ? AND isActive > 0');
var getAllQuery = factory.makeSimpleGetAll('SELECT ' + fields + ' from ' + tableName);
var getAllActiveQuery = factory.makeSimpleGetAll('SELECT ' + fields + ' from ' + tableName + ' WHERE isActive > 0');
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

exports.getWithPassword = function getWithPassword(id, callback) {
    return getPasswordQuery({ id: id }, callback);
};

exports.insert = function insert(user, callback) {
    return insertQuery(user, callback);
};

exports.update = function update(user, callback) {
    // TODO: Delete ID?
    return updateQuery({ id: user.id }, user, callback);
};

exports.exists = function exists(name, callback) {
    return existsQuery({ name: name }, callback);
};

// Create a new clean user from inbound data.
exports.createUser = factory.createCleanObjectFunction(allProps);
