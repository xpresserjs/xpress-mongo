/**
 * Omit keys
 * @param keys
 * @param returnObject
 * @returns {*}
 */
export const omitKeys = (keys: string | string[], returnObject = false): object => {
    // Turn keys to array if not array.
    if (!Array.isArray(keys)) keys = [keys];

    const data: any = {};

    for (const key of keys) {
        data[key] = 0;
    }

    return returnObject ? { projection: data } : data;
};

/**
 * Pick keys
 * @param keys
 * @param returnObject
 * @returns {*}
 */
export const pickKeys = (keys: string | string[], returnObject = false): object => {
    // Turn keys to array if not array.
    if (!Array.isArray(keys)) keys = [keys];

    const data: any = {};

    for (const key of keys) {
        data[key] = 1;
    }

    return returnObject ? { projection: data } : data;
};

/**
 * Omits _id and keys passed.
 * @param omit
 * @example
 * omitIdAnd(['name', 'email'])
 * // will return
 * {_id: 0, name: 0, email: 0}
 * @returns {{}}
 */
export const omitIdAnd = (omit: string | string[] = []): object => {
    return { _id: 0, ...omitKeys(omit) };
};

/**
 * Omits _id and pick keys passed.
 * @param pick
 *
 * @example
 * omitIdAndPick(['name', 'email'])
 * // will return
 * {_id: 0, name: 1, email: 1}
 * @returns {{}}
 */
export const omitIdAndPick = (pick: string | string[] = []): object => {
    return { _id: 0, ...pickKeys(pick) };
};
