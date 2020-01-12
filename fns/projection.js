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
 * Omits _id and keys passed.
 * @param omit
 * @example
 * omitIdAndPick(['name', 'email'])
 * // will return
 * {_id: 0, name: 1, email}
 * @returns {{}}
 */
module.exports.omitIdAnd = (omit = []) => {
    return {_id: 0, ...omitKeys(omit)};
};

/**
 * Omits _id and pick keys passed.
 * @param pick
 *
 * @example
 * omitIdAndPick(['name', 'email'])
 * // will return
 * {_id: 0, name: 1, email}
 * @returns {{}}
 */
module.exports.omitIdAndPick = (pick = []) => {
    return {_id: 0, ...pickKeys(pick)};
};