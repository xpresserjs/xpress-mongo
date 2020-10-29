import { ValidatorType, CastFunctionType, SchemaPropertiesType } from "./CustomTypes";
declare class XMongoDataType {
    schema: SchemaPropertiesType;
    constructor(name: string, $default?: any);
    name(name: string): this;
    /**
     * Set Default value.
     * @param $default
     */
    default($default: any): this;
    /**
     * Set if required
     * @param required
     */
    required(required?: boolean): this;
    /**
     * Set Validator Function/Functions
     * @param validator
     */
    validator(validator: ValidatorType): this;
    /**
     * Set Validator error
     * @param error
     */
    validatorError(error: (key: string) => string): this;
    /**
     * Set Cast function
     * @param cast
     */
    cast(cast: CastFunctionType): this;
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
    isUndefined(): this;
    /**
     * Set default value to undefined
     */
    undefined(): this;
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
    isOptional(): this;
    /**
     * Set required to false
     */
    optional(): this;
}
export = XMongoDataType;
