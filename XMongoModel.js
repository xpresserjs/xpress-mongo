const {ModelDataType} = require('./DataTypes');

/**
 * Returns a model class tied to the given collection.
 * @param connection {Collection} - This connection
 * @param collection - This collection name
 * @returns {XMongoModel}
 * @constructor
 */
function GenerateModel(connection, collection) {
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
        }

    }

    /**
     * Model Data
     * @type {*}
     */
    XMongoModel.prototype.data = {};

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


    /**
     * Direct mongodb access
     * @type {Collection}
     */
    XMongoModel.raw = connection;


    XMongoModel.find = (query, options) => {
        return connection.find(query, options).toArray()
    };

    return XMongoModel;
}

module.exports = GenerateModel;