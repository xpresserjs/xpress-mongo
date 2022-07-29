/**
 * Convert array of keys to object of keys and value.
 * @param keys
 * @param value
 */
import {string} from "joi";

export const keysToObject = <T extends string | readonly string[] | string[], V>(
    keys: T,
    value: V
) => {
    if (typeof keys === "string") keys = [keys] as T;

    // create object using array values as keys and the value as the value
    const obj = {} as T extends readonly string[] ? Record<T[number], V> : Record<string, V>;

    for (const key of keys) (obj as any)[key] = value;

    return obj;
};

/**
 * Omit keys
 * @param keys
 * @param returnObject
 * @returns {*}
 */
export const omitKeys = <Key extends string>(keys: Key | Key[], returnObject = false): Record<string, any> => {
    // Turn keys to array if not array.
    if (!Array.isArray(keys)) keys = [keys];

    const data: any = {};

    for (const key of keys) {
        data[key] = 0;
    }

    return returnObject ? {projection: data} : data;
};

/**
 * Pick keys
 * @param keys
 * @param returnObject
 * @returns {*}
 */
export const pickKeys = <Key extends string>(keys: Key | Key[], returnObject = false): Record<string, any> => {
    const data = keysToObject(keys, 1);
    return returnObject ? {projection: data} : data;
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
export const omitIdAnd = <Key extends string>(omit: Key | Key[] = []): Record<string, any> => {
    return {_id: 0, ...omitKeys(omit)};
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
export const omitIdAndPick = <Key extends string>(pick: Key | Key[] = []): Record<string, any> => {
    return {_id: 0, ...pickKeys(pick)};
};