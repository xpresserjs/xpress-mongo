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
}

ModelDataType.prototype.schema = {
    required: false,
    validator: () => true
};

class NotDefined {
}

const isString = (v) => typeof v === 'string';
const isBoolean = (v) => typeof v === 'boolean';

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
                .required(true);
        },

        /**
         * String
         * @param def
         * @return {ModelDataType}
         * @constructor
         */
        String: (def = undefined) => {
            return new ModelDataType(def)
                .validator(isString);
        },

        /**
         * Boolean
         * @param def
         * @return {ModelDataType}
         * @constructor
         */
        Boolean: (def = false) => {
            return new ModelDataType(def)
                .validator(isBoolean);
        },

        /**
         * Date
         * @param def
         * @return {ModelDataType}
         * @constructor
         */
        Date: (def = new Date().toISOString()) => {
            return new ModelDataType(def)
                .validator(isString);
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
        }
    }
};