const {ObjectID} = require('mongodb');
const {ModelDataType} = require('./DataTypes');
const {diff} = require('deep-object-diff');
const ObjectCollection = require('object-collection');
const _ = ObjectCollection._;

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
     * Model Data
     * @type {ObjectCollection}
     */
    XMongoModel.prototype.$data = new ObjectCollection;

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
    XMongoModel.prototype.get = function (key, $default) {
        return _.get(this.data, key, $default);
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
                _.set(this.data, property, key[property])
            }
        } else if (typeof key === 'string') {
            _.set(this.data, key, value)
        }
        return this;
    };


    /**
     * Set Original result gotten from db
     * @param data
     * @return {XMongoModel}
     */
    XMongoModel.prototype.setOriginal = function (data) {
        data = _.cloneDeep(data);

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
        return (this.data && this.data['_id']) || null
    };

    /**
     * See changes made so far.
     * @return {*}
     */
    XMongoModel.prototype.changes = function () {
        return diff(this.original, this.data);
    };

    /**
     * Update model
     * @param set
     * @param options
     * @return {Promise<Collection~updateWriteOpResult|Collection~insertOneWriteOpResult>}
     */
    XMongoModel.prototype.update = function (set, options) {
        if (!this.id()) throw "Model does not have an _id, so we assume it is not from the database.";
        return this.set(set).save(options)
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
                        this.setOriginal(this.data);

                        return resolve(res)
                    })
            }
        });
    };

    /**
     * Sets data as an instance of ObjectCollection on this.$data
     * @return {XMongoModel}
     */
    XMongoModel.prototype.toCollection = function () {
        if (!this.hasOwnProperty('$data')) {
            Object.defineProperty(this, '$data', {
                value: new ObjectCollection(this.data),
                writable: true,
                enumerable: false
            })
        }

        return this;
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
     * @return {*}
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
     * @param raw
     * @return {Promise<XMongoModel[]>}
     */
    XMongoModel.find = (query, options, raw = false) => {
        return new Promise((resolve, reject) => {
            const result = collection.find(query, options);

            if (raw) return resolve(result);

            return result.toArray((error, data) => {
                if (error) return reject(error);
                return resolve(data);
            });
        });
    };


    /**
     * Fetches the first document that matches the query
     * @param query
     * @param options
     * @param raw
     * @return {Promise<XMongoModel>}
     */
    XMongoModel.findOne = function (query, options, raw = false) {
        return new Promise((resolve, reject) => {
            collection.findOne(query, options, (error, data) => {
                if (error) return reject(error);
                // Return new instance of Model
                if (!data) return resolve(null);
                if (raw) return resolve(data);

                const model = new this();

                // Set Original Property
                model.setOriginal(data);
                model.set(data);

                return resolve(model);
            });
        });
    };


    /**
     * Fetches the first document that matches id provided.
     * @param _id
     * @param options
     * @param isTypeObjectId
     * @return {Promise<XMongoModel>}
     */
    XMongoModel.findById = function (_id, options={}, isTypeObjectId = true) {
        let where;
        if (!isTypeObjectId) {
            where = XMongoModel.id(_id, true);
        } else {
            where = {_id}
        }

        return this.findOne(where, options);
    };

    /**
     * Count All the documents that match query.
     * @param query
     * @param options
     * @return {void | * | Promise | undefined | IDBRequest<number>}
     */
    XMongoModel.count = function (query, options) {
        return XMongoModel.raw.find(query, options).count()
    };

    return XMongoModel;
}

module.exports = GenerateModel;