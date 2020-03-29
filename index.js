const {MongoClient} = require('mongodb');
const {is, ModelDataType} = require('./DataTypes');
const XMongoClient = require('./XMongoClient');


/**
 *
 * @param url
 * @param options
 * @param errorCallback
 * @return {XMongoClient}
 * @constructor
 */
function Client(url, options = undefined, errorCallback = undefined) {
    /**
     * If first argument i.e url is an instance of MongoClient
     * We use it instead
     */
    if (url instanceof MongoClient) return new XMongoClient(url);

    /**
     * Else we create a new one
     */
    return new XMongoClient(new MongoClient(url, options));
}

module.exports = {
    Client,
    is,
    ModelDataType
};