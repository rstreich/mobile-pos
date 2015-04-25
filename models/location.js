/**
 * 
 */

var factory = require('../lib/queryFactory');

/**
 * All the properties on Location objects
 * @const
 */
var allProps = ['id', 'name'];

/**
 * Convenience string for fields.
 * @const
 */
var fields = allProps.join();

/**
 * @const
 */
var tableName = 'Locations';

var existsQuery = factory.makeSimpleGet('SELECT name from ' + tableName + ' WHERE ? LIMIT 1');
var getQuery = factory.makeSimpleGet('SELECT ' + fields + ' FROM ' + tableName + ' where ?');
var getAllQuery = factory.makeSimpleGetAll('SELECT ' + fields + ' FROM ' + tableName + ' ORDER BY name');
var insertQuery = factory.makeSimpleInsert('INSERT INTO ' + tableName + ' SET ?');
var updateQuery = factory.makeSimpleUpdate('UPDATE ' + tableName + ' SET ? WHERE ?');

exports.get = function get(id, callback) {
    return getQuery({ id: id }, callback);
};

exports.exists = function exists(name, callback) {
    return existsQuery({ name: name }, callback);
};

exports.getAll = function getAll(callback) {
    return getAllQuery(callback);
};

exports.insert = function insert(location, callback) {
    return insertQuery(location, callback);
};

exports.update = function update(location, callback) {
    return updateQuery({ id: location.id }, location, callback);
};

//Create a new clean location from inbound data.
exports.createLocation = factory.createCleanObjectFunction(allProps);
