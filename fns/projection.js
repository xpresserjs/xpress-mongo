/**
 * Omit keys
 * @param keys
 * @param returnObject
 * @returns {*}
 */
function omitKeys(keys, returnObject = false) {
    // Turn keys to array if not array.
    if (!Array.isArray(keys)) keys = [keys];

    const data = {};
    for (const key of keys) {
        data[key] = 0;
    }
    return returnObject ? {projection: data} : data;
}


/**
 * Pick keys
 * @param keys
 * @param returnObject
 * @returns {*}
 */
function pickKeys(keys, returnObject = false) {
    // Turn keys to array if not array.
    if (!Array.isArray(keys)) keys = [keys];

    const data = {};
    for (const key of keys) {
        data[key] = 1;
    }
    return returnObject ? {projection: data} : data;
}


module.exports.omitKeys = omitKeys;
module.exports.pickKeys = pickKeys;

/**
 * Get both pick and omit arrays
 * @param pick
 * @param omit
 * @returns {{}}
 */
module.exports.omitAndPick = (omit = [], pick = []) => {
    return {...omitKeys(pick), ...pickKeys(omit)};
};