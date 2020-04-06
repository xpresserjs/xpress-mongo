import {FunctionReturnsBoolean, SchemaPropertiesType, ValidatorType} from "../src/CustomTypes";

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
export function defaultValue(data: SchemaPropertiesType): any {
    // Return undefined if no default property in data.
    if (!data || (data && !data.hasOwnProperty('default'))) return undefined;

    // Run and return default function data.
    if (typeof data['default'] === "function") return data.default();

    // return default value.
    return data.default;
}

/**
 * RunOrValidation
 * @description
 * Run validators and stop if any is true
 * @param {*} value
 * @param {ValidatorType[]} validators
 * @return {boolean}
 */
export function runOrValidation(value: any, validators: ValidatorType[] | FunctionReturnsBoolean[]): boolean {
    for (const validator of validators) {
        if (typeof validator === 'function' && validator(value) === true) {
            return true
        } else if (typeof validator === 'object' && validator.hasOwnProperty('or')) {
            if (runOrValidation(value, <FunctionReturnsBoolean[]>validator['or'])) {
                return true;
            }
        }
    }

    return false;
}

/**
 * RunAndValidation
 * @description
 * Run validators and stop if any is false
 * @param {*} value
 * @param {[]} validators
 * @return {boolean}
 */
export function runAndValidation(value: any, validators: ValidatorType[] | FunctionReturnsBoolean[]): boolean {
    for (const validator of validators) {
        if (typeof validator === 'function' && validator(value) === true) return false
    }

    return true;
}