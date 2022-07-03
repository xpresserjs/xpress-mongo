import escapeRegexp from "escape-string-regexp-node";
import type {Paginated} from "../src/types/pagination";

export { escapeRegexp };

/**
 * Make a pagination object
 * @param merge
 * @constructor
 */
export function DefaultPaginationData<T>(merge: Partial<Paginated> = {}): Paginated<T> {
    return {
        page: 1,
        perPage: 0,
        total: 0,
        lastPage: 1,
        data: [] as T[],
        ...merge
    };
}
