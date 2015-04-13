/**
 * 
 */

var factory = require('../lib/queryFactory');

//TODO: MAYBE--Add optimistic locking.

/* jshint laxbreak:true */
var baseSelect = 'SELECT Items.id AS id,'
    +  ' Items.name AS name,'
    +  ' Items.unitPrice AS unitPrice,'
    +  ' Items.image AS image,'
    +  ' Items.isActive as isActive,'
    +  ' UnitsOfMeasure.id AS uomId,'
    +  ' UnitsOfMeasure.name AS uomName'
    + ' FROM Items'
    + ' JOIN UnitsOfMeasure'
    +  ' ON Items.uom = UnitsOfMeasure.id';

var orderBy = ' ORDER BY name';

/**
 * Because of the join for units of measure, the simple part of the "get" properties are here.
 * @const
 */
var getProps = ['id', 'name', 'unitPrice', 'isActive', 'image', 'created'];

/**
 * All the properties on Item objects
 * @const
 */
var allProps = getProps.concat('uom');

/**
 * Convenience string for fields
 * @const
 */
var fields = allProps.join();
/**
 * @const
 */
var tableName = 'Items';

var getQuery = factory.makeSimpleGet(baseSelect + ' where ?');
var getAllQuery = factory.makeSimpleGetAll(baseSelect + orderBy);
var getAllActiveQuery = factory.makeSimpleGetAll(baseSelect + ' WHERE isActive > 0' + orderBy);
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

var copyGetProps = factory.createCleanObjectFunction(getProps);

/*
 * Object factory for transforming a result row into an outbound item--one with a UOM object instead of just an ID.
 */
function makeGetHandler(callback) {
    function convertItem(rawItem) {
        var item = copyGetProps(rawItem);
        item.uom = { id: rawItem.uomId, name: rawItem.uomName };
        return item;
    }

    return function itemTransform(err, results) {
        if (err) {
            return callback(err);
        }
        var transformedResults = [];
        for (var i = 0; i < results.length; ++i) {
            transformedResults.push(convertItem(results[i]));
        }
        callback(null, transformedResults);
    };
}

exports.get = function get(id, callback) {
    var keyObj = {};
    keyObj[tableName + '.id'] = id;
    return getQuery(keyObj, makeGetHandler(callback));
};

exports.getAll = function getAll(callback, includeInactive) {
    var getHandler = makeGetHandler(callback);
    if (includeInactive) {
        return getAllQuery(getHandler);
    }
    return getAllActiveQuery(getHandler);
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

/**
 * Create a new clean item from inbound data.
 *
 * Items on the client side have a full UOM object. This just copies out the ID for writing to the record.
 */
exports.createItem = function createCleanItem(inboundItem) {
    var item = copyGetProps(inboundItem);
    item.uom = (inboundItem.uom ? inboundItem.uom.id : null);
    return item;
};
