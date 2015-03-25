/**
 * 
 */

var factory = require('../lib/queryFactory');

//TODO: MAYBE--Add optimistic locking.

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

var getQuery = factory.makeSimpleGet('SELECT ' + fields + ' from ' + tableName + ' where ?');
var getAllQuery = factory.makeSimpleGetAll('SELECT ' + fields + ' from ' + tableName);
var insertQuery = factory.makeSimpleInsert('INSERT INTO ' + tableName + ' SET ?');
var updateQuery = factory.makeSimpleUpdate('UPDATE ' + tableName + ' SET ? WHERE id?');

exports.get = function get(id, callback) {
    getQuery({ id: id }, callback);
};

exports.getAll = function getAll(callback) {
    getAllQuery(callback);
};

exports.insert = function insert(name, callback) {
    insertQuery({ name: name }, callback);
};

exports.update = function update(location, callback) {
    updateQuery({ id: location.id }, { name: location.name }, callback);
};

//Create a new clean location from inbound data.
exports.createLocation = factory.createCleanObjectFunction(allProps);
