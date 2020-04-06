import {ValidatorType, CastFunctionType, SchemaPropertiesType} from "./CustomTypes";


class XMongoDataType {
    public schema: SchemaPropertiesType = {
        name: '',
        required: false,
        validator: () => true,
        validationError: () => 'Validation Error',
        cast: null,
    };

    constructor(name: string, $default?: any) {
        this.schema.name = name;
        this.schema.default = $default;
        this.schema.validationError = (key) => `${key} failed ${name} validation.`;
    }

    default($default: any) {
        this.schema.default = $default;
        return this;
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
    validator(validator: ValidatorType) {
        this.schema.validator = validator;
        return this;
    }

    validatorError(error: (key: string) => string) {
        this.schema.validationError = error;
        return this;
    }

    cast(cast: CastFunctionType) {
        this.schema.cast = cast;
        return this;
    }
}

export = XMongoDataType;