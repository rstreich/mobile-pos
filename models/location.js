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

var getQuery = factory.makeSimpleGet('SELECT ' + fields + ' FROM ' + tableName + ' where ?');
var getAllQuery = factory.makeSimpleGetAll('SELECT ' + fields + ' FROM ' + tableName + ' ORDER BY name');
var insertQuery = factory.makeSimpleInsert('INSERT INTO ' + tableName + ' SET ?');
var updateQuery = factory.makeSimpleUpdate('UPDATE ' + tableName + ' SET ? WHERE ?');

exports.get = function get(id, callback) {
    getQuery({ id: id }, callback);
};

exports.getAll = function getAll(callback) {
    getAllQuery(callback);
};

exports.insert = function insert(location, callback) {
    insertQuery(location, callback);
};

exports.update = function update(location, callback) {
    updateQuery({ id: location.id }, location, callback);
};

//Create a new clean location from inbound data.
exports.createLocation = factory.createCleanObjectFunction(allProps);
