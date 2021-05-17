import { MongoClient, MongoClientOptions } from "mongodb";
import is = require("./src/SchemaBuilder");
import Projectors = require("./fn/projection");
import XMongoDataType = require("./src/XMongoDataType");
import XMongoClient = require("./src/XMongoClient");
import XMongoModel = require("./src/XMongoModel");
import { XMongoSchemaBuilder, XMongoSchema, XMongoSchemaFn } from "./src/CustomTypes";
import Joi = require("joi");

const { omitIdAndPick, omitIdAnd, omitKeys, pickKeys } = Projectors;

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
function parseServerUrl(url: string, options: { dbname: string; password: string }) {
    if (options.dbname) {
        url = url.replace("<dbname>", options.dbname);
    }

    if (options.password) {
        options.password = encodeURI(options.password);
        url = url.replace("<password>", options.password);
    }

    return url;
}

/**
 * Adds an event to set a fields Timestamp to current date on update.
 * Remove if not in use.
 */
function RefreshDateOnUpdate(
    Model: typeof XMongoModel,
    field: string,
    ifHasChanges: boolean = true
) {
    if (ifHasChanges) {
        Model.on(`update.${field}`, (model) => {
            if (Object.keys(model.changes()).length) {
                return new Date();
            }
        });
    } else {
        Model.on(`update.${field}`, () => new Date());
    }
}

export {
    // Export is schemaBuilder
    is,
    // Export Joi as joi to avoid conflict with consumer's own Joi version.
    Joi as joi,
    // Export Client
    Client,
    // Export Model Class and Helpers
    XMongoModel,
    XMongoDataType,
    // Export Most Used Types
    XMongoSchemaBuilder,
    XMongoSchema,
    XMongoSchemaFn,
    // Export Projectors for quicker requirement
    omitKeys,
    pickKeys,
    omitIdAnd,
    omitIdAndPick,
    // Others
    parseServerUrl,
    RefreshDateOnUpdate
};
