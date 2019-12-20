const {MongoClient} = require('mongodb');
const {is} = require('./DataTypes');
const XMongoClient = require('./XMongoClient');


/**
 *
 * @param url
 * @param options
 * @param errorCallback
 * @return {XMongoClient}
 * @constructor
 */
function Client(url, options, errorCallback = undefined) {
    return new XMongoClient(new MongoClient(url, options));
}

module.exports = {
    Client,
    is,
};