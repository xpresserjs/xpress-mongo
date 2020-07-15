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

    /**
     * Set Default value.
     * @param $default
     */
    default($default: any) {
        this.schema.default = $default;
        return this;
    }

    /**
     * Set if required
     * @param required
     */
    required(required = true) {
        this.schema.required = required;
        return this;
    }

    /**
     * Set Validator Function/Functions
     * @param validator
     */
    validator(validator: ValidatorType) {
        this.schema.validator = validator;
        return this;
    }

    /**
     * Set Validator error
     * @param error
     */
    validatorError(error: (key: string) => string) {
        this.schema.validationError = error;
        return this;
    }

    /**
     * Set Cast function
     * @param cast
     */
    cast(cast: CastFunctionType) {
        this.schema.cast = cast;
        return this;
    }

    /**
     * Set default value to undefined
     */
    isUndefined() {
        return this.default(undefined);
    }

    /**
     * Set required to false
     */
    isOptional() {
        return this.required(false);
    }
}

export = XMongoDataType;