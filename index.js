const {is, ModelDataType} = require('./DataTypes');

/**
 * Returns a model class tied to the given collection.
 * @param collection - Collection Name
 * @returns {Model}
 * @constructor
 */
function Collection(collection) {
    class Model {

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

        /**
         * Set Model Schema
         *
         * if `schema` is undefined then `this.data` is used as schema object
         *
         * @param schema
         */
        $setSchema(schema = undefined) {
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
        }

        get(key) {
            return this.data[key] || undefined;
        }

        set(key, value) {
            let data = this.data;
            if (typeof key === 'object' && value === undefined) {
                for (const property in key) {
                    Object.defineProperty(data, property, {
                        value: key[property],
                        writable: true
                    })
                }
            } else if (typeof key === 'string') {
                Object.defineProperty(data, key, {
                    value,
                    writable: true
                })
            }
            return this;
        }
    }

    /**
     * Model Data
     * @type {*}
     */
    Model.prototype.data = {};

    /**
     * @private
     * @type {{}}
     */
    Model.prototype.schema = {};

    return Model;
}

module.exports = {
    Collection,
    is
};