import { MongoClient, MongoClientOptions } from "mongodb";
import { is, XMongoSchemaBuilder } from './src/XMongoSchemaBuilder';
import * as Projectors from './fn/projection';
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
declare function Client(url: string | MongoClient, options?: MongoClientOptions): XMongoClient;
export { is, Client, Projectors, XMongoModel, XMongoDataType, XMongoSchemaBuilder };
