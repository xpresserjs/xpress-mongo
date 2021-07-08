import {
    ValidatorType,
    CastFunctionType,
    SchemaPropertiesType,
    RequiredIf,
    UseJoi,
    FnWithArg
} from "./CustomTypes";
import Joi from "joi";
import XMongoModel from "./XMongoModel";

class XMongoDataType {
    public schema: SchemaPropertiesType = {
        name: "",
        required: false,
        validator: () => true,
        validationError: () => "Validation Error",
        cast: null,
        isJoi: false
    };

    constructor(name: string, $default?: any) {
        this.schema.name = name;
        this.schema.default = $default;
        this.schema.validationError = (key) => `${key} failed ${name} validation.`;
    }

    /**
     * Set Schema Name
     * @param name
     */
    name(name: string) {
        if (name) {
            this.schema.name = name;
        }

        return this;
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
    required(required: boolean = true): this {
        this.schema.required = required;
        return this;
    }

    /**
     * Set conditional Required if
     * @param fn
     */
    requiredIf(fn: RequiredIf) {
        this.schema.required = fn;
        return this;
    }

    /**
     * Set Validator Function/Functions
     * @param validator
     */
    validator(validator: ValidatorType): this {
        this.schema.validator = validator;
        // if isJoi, set to false
        if (this.schema.isJoi) this.schema.isJoi = false;
        return this;
    }

    /**
     * Set Validator to joi schema
     * @param schema
     */
    joi(schema: Joi.Schema | UseJoi) {
        // Run if function
        if (typeof schema === "function") {
            schema = schema(Joi);
        }

        // Set Validator
        this.schema.validator = schema;
        this.schema.isJoi = true;

        this.default(schema.$_getFlag("default"));
        this.required(schema.$_getFlag("presence") === "required");

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
     *
     * @example
     *  // Deprecated
     *  is.Number().isUndefined()
     *  // use instead
     *  is.Number().undefined()
     * @deprecated since (v 0.0.52)
     * @removed at (v1.0.0)
     */
    isUndefined(): this {
        return this.default(undefined);
    }

    /**
     * Set default value to undefined
     */
    undefined(): this {
        return this.default(undefined);
    }

    /**
     * Set required to false (use `.optional()`)
     *
     * @example
     *  // Deprecated
     *  is.String().isOptional()
     *  // use instead
     *  is.String().optional()
     * @deprecated since (v 0.0.52)
     * @removed at (v1.0.0)
     */
    isOptional(): this {
        return this.required(false);
    }

    /**
     * Set required to false
     */
    optional(): this {
        return this.required(false);
    }

    unique<c = XMongoModel>(options?: {
        query?: FnWithArg<c, Record<string, any>>;
        // replaceWith?: FnWithArg<c>;
    }): this {
        this.schema.isUnique = true;
        this.schema.uniqueQuery = options;
        return this;
    }
}

export = XMongoDataType;
