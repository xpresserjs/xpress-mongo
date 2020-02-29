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

    validator(validator = () => true) {
        this.schema.validator = validator;
        return this;
    }

    validatorError(error) {
        this.schema.validationError = error;
        return this;
    }
}

ModelDataType.prototype.schema = {
    required: false,
    validator: () => true
};

class NotDefined {
}

const isString = (v) => typeof v === 'string';
const isBoolean = (v) => typeof v === 'boolean';
const isObject = (v) => v && typeof v === 'object';
const isArray = (v) => Array.isArray(v);
const isDate = (v) => v instanceof Date;

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
            return new ModelDataType(null)
                .required(true)
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
        },

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
                .validator(isNaN)
                .validatorError((key) => `(${key}) is not a Number`);
        }
    }
};