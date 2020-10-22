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
    default($default: any): this {
        this.schema.default = $default;
        return this;
    }

    /**
     * Set if required
     * @param required
     */
    required(required = true): this {
        this.schema.required = required;
        return this;
    }

    /**
     * Set Validator Function/Functions
     * @param validator
     */
    validator(validator: ValidatorType): this {
        this.schema.validator = validator;
        return this;
    }

    /**
     * Set Validator error
     * @param error
     */
    validatorError(error: (key: string) => string): this {
        this.schema.validationError = error;
        return this;
    }

    /**
     * Set Cast function
     * @param cast
     */
    cast(cast: CastFunctionType): this {
        this.schema.cast = cast;
        return this;
    }

    /**
     * Set default value to undefined
     */
    isUndefined(): this {
        return this.default(undefined);
    }

    /**
     * Set required to false
     */
    isOptional(): this {
        return this.required(false);
    }
}

export = XMongoDataType;