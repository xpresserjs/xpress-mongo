import { MongoClient } from "mongodb";
import { is } from './src/XMongoSchemaBuilder';
import * as Projectors from './fn/projection';
import ModelDataType = require('./src/XMongoDataType');
import XMongoClient = require('./src/XMongoClient');
import XMongoModel = require('./src/XMongoModel');
/**
 *
 * @param url
 * @param options
 * @param errorCallback
 * @return {XMongoClient}
 * @constructor
 */
declare function Client(url: string | MongoClient, options?: undefined, errorCallback?: undefined): XMongoClient;
export { Client, is, XMongoModel, ModelDataType, Projectors };
