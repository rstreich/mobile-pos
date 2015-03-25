/**
 * 
 */

var factory = require('../lib/queryFactory');

//TODO: MAYBE--Add optimistic locking.

/**
 * All the properties on Location objects
 * @const
 */
var allProps = ['id', 'description', 'uom', 'unitPrice', 'isActive', 'image', 'created'];

/**
 * Convenience string for fields
 * @const
 */
var fields = allProps.join();
/**
 * @const
 */
var tableName = 'Items';

var getQuery = factory.makeSimpleGet('SELECT ' + fields + ' from ' + tableName + ' where ?');
var getAllQuery = factory.makeSimpleGetAll('SELECT ' + fields + ' from ' + tableName);
var getAllActiveQuery = factory.makeSimpleGetAll('SELECT ' + fields + ' from ' + tableName + ' WHERE isActive > 0');
var insertQuery = factory.makeSimpleInsert('INSERT INTO ' + tableName + ' SET ?');
var updateQuery = factory.makeSimpleUpdate('UPDATE ' + tableName + ' SET ? WHERE ?');
var deleteAllQuery = factory.makeDeleteAll(tableName);

/**
 * @const
 */
exports.DISCOUNT_ID = 1;
/**
 * @const
 */
exports.DONATION_ID = 2;

exports.get = function get(id, callback) {
    return getQuery({ id: id }, callback);
};

exports.getAll = function getAll(callback, includeInactive) {
    if (includeInactive) {
        return getAllQuery(callback);
    }
    return getAllActiveQuery(callback);
};

// PROTECTED: Admin only
exports.insert = function insert(item, callback) {
    return insertQuery(item, callback);
};

// PROTECTED: Admin only
exports.update = function update(item, callback) {
    return updateQuery({ id: item.id }, item, callback);
};

// PROTECTED: Testing only
exports.deleteAll = function deleteAll(callback) {
    return deleteAllQuery(callback);
};

//Create a new clean item from inbound data.
exports.createItem = factory.createCleanObjectFunction(allProps);
