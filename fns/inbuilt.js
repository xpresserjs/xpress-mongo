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
function defaultValue(data) {
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
 * @param {[]} validators
 * @return {boolean}
 */
function runOrValidation(value, validators = []) {
    for (const validator of validators) {
        if (validator(value) === true) return true
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
function runAndValidation(value, validators = []) {
    for (const validator of validators) {
        if (!validator(value)) return false
    }

    return true;
}

module.exports = {
    defaultValue,
    runOrValidation,
    runAndValidation
};