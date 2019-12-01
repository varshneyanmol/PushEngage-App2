const ObjectId = require('mongoose').Types.ObjectId;
const bsonObjectId = require('bson-objectid');

/**
 * Takes an id and returns null if id is a invalid mongodb _id, otherwise returns mongoose ObjectId
 * @param id
 * @returns {null|ObjectId}
 */
module.exports.toObjectId = function (id) {
    if (!id)
        return null;

    const stringId = id.toString().toLowerCase().trim();
    if (!ObjectId.isValid(stringId))
        return null;

    /*
    Here string id is casted to mongoose object id because
    in some cases mongoose considers string a valid object id, if it is 12 characters long
     */
    const result = new ObjectId(stringId);
    return result.toString() !== stringId
        ? null
        : result;
};

module.exports.toObjectIdFromDate = function (date) {
    if (!date)
        return null;

    return bsonObjectId(date.getTime() / 1000);
};
