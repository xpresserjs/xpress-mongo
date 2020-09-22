import {MongoClient, MongoClientOptions} from "mongodb";
import {is, XMongoSchemaBuilder} from './src/XMongoSchemaBuilder';
import {omitIdAndPick, omitIdAnd, omitKeys, pickKeys} from './fn/projection';
import XMongoDataType = require('./src/XMongoDataType');
import XMongoClient = require('./src/XMongoClient');
import XMongoModel = require('./src/XMongoModel');

/**
 * Get connected to a client
 * @param {string|MongoClient} url
 * @param {MongoClientOptions} options
 * @return {XMongoClient}
 * @constructor
 */
function Client(url: string | MongoClient, options: MongoClientOptions = {}): XMongoClient {
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

/**
 * Mongodb online server url parser.
 * Inserts dbname and URI encoded password
 * @param url
 * @param options
 */
function parseServerUrl(url: string, options: { dbname: string, password: string }) {
    options.password = encodeURI(options.password);
    return url.replace('<dbname>', options.dbname)
        .replace('<password>', options.password);
}

export {
    // Export is schemaBuilder
    is,

    // Export Client
    Client,

    // Export Model Class and Helpers
    XMongoModel,
    XMongoDataType,
    XMongoSchemaBuilder,

    // Export Projectors for quicker requirement
    omitKeys,
    pickKeys,
    omitIdAnd,
    omitIdAndPick,

    // Others
    parseServerUrl
};