import { ValidatorType, CastFunctionType, SchemaPropertiesType } from "./CustomTypes";
declare class XMongoDataType {
    schema: SchemaPropertiesType;
    constructor(name: string, $default?: any);
    default($default: any): this;
    required(required?: boolean): this;
    /**
     * Set Type Validator
     * @param {function|{or: Array}|{and: Array}} validator
     * @return {ModelDataType}
     */
    validator(validator: ValidatorType): this;
    validatorError(error: (key: string) => string): this;
    cast(cast: CastFunctionType): this;
}
export = XMongoDataType;
