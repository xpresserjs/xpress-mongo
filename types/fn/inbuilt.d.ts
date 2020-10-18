import { FunctionReturnsBoolean, SchemaPropertiesType, ValidatorType } from "../src/CustomTypes";
import XMongoModel from "../src/XMongoModel";
/**
 * Get Default value.
 *
 * @description
 * In a situation where default value is an object, it is called to get the real default value.
 * @example
 * is.Date() default value is a function that needs to be executed to get the current date at the execution time.
 *
 * @returns {*}
 * @param data
 */
export declare function defaultValue(data: SchemaPropertiesType): any;
/**
 * RunOrValidation
 * @description
 * Run validators and stop if any is true
 * @param {*} value
 * @param {ValidatorType[]} validators
 * @return {boolean}
 */
export declare function runOrValidation(value: any, validators: ValidatorType[] | FunctionReturnsBoolean[]): boolean;
/**
 * RunAndValidation
 * @description
 * Run validators and stop if any is false
 * @param {*} value
 * @param {[]} validators
 * @return {boolean}
 */
export declare function runAndValidation(value: any, validators: ValidatorType[] | FunctionReturnsBoolean[]): boolean;
export declare function RunOnEvent(event: string, modelInstance: XMongoModel, changes?: string[]): Promise<any>;
