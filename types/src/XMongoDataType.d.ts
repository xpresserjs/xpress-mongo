import { ValidatorType, CastFunctionType, SchemaPropertiesType } from "./CustomTypes";
declare class XMongoDataType {
    schema: SchemaPropertiesType;
    constructor(name: string, $default?: any);
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
     */
    isUndefined(): this;
    /**
     * Set required to false
     */
    isOptional(): this;
}
export = XMongoDataType;
