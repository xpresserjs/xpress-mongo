/**
 * Omit keys
 * @param keys
 * @param returnObject
 * @returns {*}
 */
export declare const omitKeys: (keys: string | string[], returnObject?: boolean) => object;
/**
 * Pick keys
 * @param keys
 * @param returnObject
 * @returns {*}
 */
export declare const pickKeys: (keys: string | string[], returnObject?: boolean) => object;
/**
 * Omits _id and keys passed.
 * @param omit
 * @example
 * omitIdAnd(['name', 'email'])
 * // will return
 * {_id: 0, name: 0, email: 0}
 * @returns {{}}
 */
export declare const omitIdAnd: (omit?: string | string[]) => object;
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
export declare const omitIdAndPick: (pick?: string | string[]) => object;
