import {MongoClient} from "mongodb";
import {is} from './src/XMongoSchemaBuilder';
import * as Projectors from './fn/projection';
import ModelDataType = require('./src/XMongoDataType');
import XMongoClient = require('./src/XMongoClient');




/**
 *
 * @param url
 * @param options
 * @param errorCallback
 * @return {XMongoClient}
 * @constructor
 */
function Client(url: string | MongoClient, options = undefined, errorCallback = undefined): XMongoClient {
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

export {Client, is, ModelDataType, Projectors};