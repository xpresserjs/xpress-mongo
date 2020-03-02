const {ObjectID} = require('mongodb');

class ModelDataType {
    constructor($default = undefined) {
        this.schema = {
            default: $default
        };
    }

    required(required = true) {
        this.schema.required = required;
        return this;
    }

    /**
     * Set Type Validator
     * @param {function|{or: Array}|{and: Array}} validator
     * @return {ModelDataType}
     */
    validator(validator = () => true) {
        this.schema.validator = validator;
        return this;
    }

    validatorError(error) {
        this.schema.validationError = error;
        return this;
    }

    cast(cast) {
        this.schema.cast = cast;
        return this;
    }
}

ModelDataType.prototype.schema = {
    required: false,
    validator: () => true,
    validationError: () => 'Validation Error',
    cast: null,
};

class NotDefined {
}

const isString = (v) => typeof v === 'string';
const isBoolean = (v) => typeof v === 'boolean';
const isObject = (v) => (v && typeof v === 'object');
const isArray = (v) => Array.isArray(v);
const isDate = (v) => v instanceof Date;
const isNumber = (v) => !isNaN(v);


isObject(null);


/**
 * DataTypes
 * @type {{NotDefined: NotDefined, ModelDataType: ModelDataType, is: {Number: (function(*=): ModelDataType), ObjectId: (function(): ModelDataType), String: (function(*=): ModelDataType), Boolean: (function(*=): ModelDataType), Date: (function(*=): ModelDataType)}}}
 */
module.exports = {
    NotDefined,
    ModelDataType,
    is: {
        /**
         * ObjectId
         * @return {ModelDataType}
         * @constructor
         */
        ObjectId: () => {
            return new ModelDataType(undefined)
                .validator({
                    or: [isString, isObject]
                })
                .cast((val, key) => {

                    if (typeof val === "object" && ObjectID.isValid(val)) {
                        return val
                    }

                    try {
                        return new ObjectID(val);
                    } catch (e) {
                        throw  TypeError(`(${key}) is not valid Mongodb-ObjectID`);
                    }
                })
                .validatorError((key) => `(${key}) is not a Mongodb-ObjectID`);

        },

        /**
         * Array
         * @param def
         * @return {ModelDataType}
         * @constructor
         */
        Array: (def = () => ([])) => {
            return new ModelDataType(def)
                .validator(isArray)
                .validatorError((key) => `(${key}) is not an Array`);
        },


        /**
         * Object
         * @param def
         * @return {ModelDataType}
         * @constructor
         */
        Object: (def = () => ({})) => {
            return new ModelDataType(def)
                .validator(isObject)
                .validatorError((key) => `(${key}) is not an Object`);

        },

        /**
         * String
         * @param def
         * @return {ModelDataType}
         * @constructor
         */
        String: (def = undefined) => {
            return new ModelDataType(def)
                .validator(isString)
                .validatorError((key) => `(${key}) is not a String`);
        },

        /**
         * Boolean
         * @param def
         * @return {ModelDataType}
         * @constructor
         */
        Boolean: (def = false) => {
            return new ModelDataType(def)
                .validator(isBoolean)
                .validatorError((key) => `(${key}) is not a Boolean`);

        },

        /**
         * Date
         * @param def
         * @return {ModelDataType}
         * @constructor
         */
        Date: (def = () => new Date()) => {
            return new ModelDataType(def)
                .validator(isDate)
                .validatorError((key) => `(${key}) is not a Date`);
        },

        /**
         * Number
         * @param def
         * @return {ModelDataType}
         * @constructor
         */
        Number: (def = 0) => {
            return new ModelDataType(def)
                .validator(isNumber)
                .cast((v) => Number(v))
                .validatorError((key) => `(${key}) is not a Number`);
        }
    }
};