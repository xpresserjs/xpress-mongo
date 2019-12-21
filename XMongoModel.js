const {ObjectID} = require('mongodb');
const {ModelDataType} = require('./DataTypes');
const {diff} = require('deep-object-diff');


/**
 * Returns a model class tied to the given collection.
 * @param collection {Collection} - This connection
 * @returns {XMongoModel}
 * @constructor
 */
function GenerateModel(collection) {

    class XMongoModel {

        /**
         * Model Constructor
         *
         * The model constructor only initializes `this.action`
         * and passes a function that returns `this.data` to the `ModelActions` class.
         *
         * The ModelAction class uses this function to access this models data.
         */
        constructor() {
            // Assume data is empty
            this.data = {};
            Object.defineProperty(this, 'schema', {
                value: {},
                write: true,
                enumerable: false
            });
        }

    }

    /**
     * Model Data
     * @type {*}
     */
    XMongoModel.prototype.data = {};

    /**
     * Model Original Data
     * @type {*}
     */
    XMongoModel.prototype.original = {};

    /**
     * Model Schema
     * @private
     * @type {{}}
     */
    XMongoModel.prototype.schema = {};


    /**
     * Get Data in model
     * @param key
     * @return {*|undefined}
     */
    XMongoModel.prototype.get = function (key) {
        return this.data[key] || undefined;
    };

    /**
     * Set data in model
     * @param key
     * @param value
     * @return {XMongoModel}
     */
    XMongoModel.prototype.set = function (key, value) {
        if (typeof key === 'object' && value === undefined) {
            for (const property in key) {
                Object.defineProperty(this.data, property, {
                    value: key[property],
                    writable: true,
                    enumerable: true,
                })
            }
        } else if (typeof key === 'string') {
            Object.defineProperty(this.data, key, {
                value,
                writable: true,
                enumerable: true,
            });
        }
        return this;
    };


    /**
     * Set Original result gotten from db
     * @param data
     * @return {XMongoModel}
     */
    XMongoModel.prototype.setOriginal = function (data) {
        Object.defineProperty(this, 'original', {
            value: data,
            write: true,
            enumerable: false
        });

        return this;
    };


    /**
     * Set Model Schema
     *
     * if `schema` is undefined then `this.data` is used as schema object
     * @param schema
     * @returns {XMongoModel}
     */
    XMongoModel.prototype.setSchema = function (schema = undefined) {
        const schemaIsData = schema === undefined;
        schema === undefined && (schema = this.data);
        const newData = {};


        for (const key in schema) {
            if (schema.hasOwnProperty(key)) {
                const val = schema[key];

                if (val instanceof ModelDataType) {
                    this.schema[key] = val['schema'];
                }

                const dataVal = this.data[key];
                const dataValIsNotBoolean = typeof dataVal !== "boolean";

                if (!schemaIsData && dataValIsNotBoolean && !dataVal) {
                    newData[key] = val['schema'].default;
                } else if (schemaIsData && dataVal instanceof ModelDataType) {
                    newData[key] = dataVal['schema'].default
                } else {
                    newData[key] = dataVal
                }
            }
        }

        /**
         * Fill up keys defined in data but not in schema
         */
        for (const key in this.data) {
            if (!newData.hasOwnProperty(key)) {
                newData[key] = this.data[key]
            }
        }

        this.data = newData;

        return this;
    };


    XMongoModel.prototype.id = function () {
        return this.data['_id'] || null
    };

    /**
     * See changes made so far.
     * @return {*}
     */
    XMongoModel.prototype.changes = function () {
        return diff(this.original, this.data);
    };

    /**
     * Create Model if not id is missing or save document if id is found.
     * @param options
     * @return {Promise<Collection~updateWriteOpResult|Collection~insertOneWriteOpResult>}
     */
    XMongoModel.prototype.save = function (options) {
        return new Promise((resolve, reject) => {
            const id = this.id();

            if (id) {
                return collection.updateOne(
                    {_id: this.id()},
                    {$set: this.changes()},
                    options,
                    (error, res) => error ? reject(error) : resolve(res.connection))
            } else {
                return collection.insertOne(
                    this.data,
                    options,
                    (error, res) => {
                        if (error) return reject(error);
                        const {insertedId} = res;
                        this.set('_id', insertedId);

                        return resolve(res)
                    })
            }
        });
    };


    /**
     * Direct mongodb access
     * @type {Collection}
     */
    XMongoModel.raw = collection;


    /**
     * Alias to mongo.ObjectID
     * @param str {*}
     * @param returnObject
     * @return {{_id: MongoClient.connect.ObjectID}|MongoClient.connect.ObjectID}
     */
    XMongoModel.id = (str, returnObject = false) => {
        let _id;

        if (typeof str === "string") {
            try {
                _id = new ObjectID(str);
            } catch (e) {
                _id = str;
            }
        }

        if (returnObject) {
            return {_id}
        } else {
            return _id
        }
    };


    /**
     * Find many in collection
     * @param query
     * @param options
     * @return {Promise<XMongoModel[]>}
     */
    XMongoModel.find = (query, options) => {
        return new Promise((resolve, reject) => {
            collection.find(query, options).toArray((error, data) => {
                if (error) return reject(error);
                return resolve(data);
            });
        });
    };


    /**
     * Fetches the first document that matches the query
     * @param query
     * @param options
     * @return {Promise<XMongoModel>}
     */
    XMongoModel.findOne = (query, options) => {
        return new Promise((resolve, reject) => {
            collection.findOne(query, options, (error, data) => {
                if (error) return reject(error);
                // Return new instance of Model
                const model = new XMongoModel();

                // Set Original Property
                model.setOriginal(data);
                model.set(data);

                return resolve(model);
            });
        });
    };


    XMongoModel.findOneById = function (_id, isTypeObjectId = true) {
        let where;
        if (isTypeObjectId) {
            where = XMongoModel.id(_id, true);
        } else {
            where = {_id}
        }

        return XMongoModel.findOne(where);
    };

    return XMongoModel;
}

module.exports = GenerateModel;