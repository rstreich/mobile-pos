var factory = require('../lib/queryFactory');

//TODO: MAYBE--Add optimistic locking.

/**
 * All the properties on UnitsOfMeasure objects
 * @const
 */
var allProps = ['id', 'name'];

/**
 * Convenience string for all fields.
 * @const
 */
var fields = allProps.join();

/**
 * @const
 */
var tableName = 'UnitsOfMeasure';

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

exports.update = function update(uom, callback) {
    updateQuery({ id: uom.id }, { name: uom.name }, callback);
};

//Create a new clean unit of measure from inbound data.
exports.createUnitOfMeasure = factory.createCleanObjectFunction(allProps);
