import escapeRegexp from "escape-string-regexp-node";
import type { PaginationData } from "../src/CustomTypes";

export { escapeRegexp };

/**
 * Make a pagination object
 * @param merge
 * @constructor
 */
export function DefaultPaginationData<T>(merge: Partial<PaginationData> = {}): PaginationData<T> {
    return {
        page: 1,
        perPage: 0,
        total: 0,
        lastPage: 1,
        data: [] as T[],
        ...merge
    };
}
