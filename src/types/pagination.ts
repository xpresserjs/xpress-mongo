export interface PaginationMeta {
    total: number;
    perPage: number;
    page: number;
    lastPage: number;
}

export interface Paginated<T = any> extends PaginationMeta {
    data: T[];
}

export interface PaginatedMetaData<T = any> {
    meta: PaginationMeta;
    data: T[];
}

/**
 * Make a pagination object
 * @constructor
 */
export function Paginated<T>(): Paginated<T> {
    return {
        total: 0,
        perPage: 0,
        page: 1,
        lastPage: 1,
        data: [] as T[]
    };
}

/**
 * Make a pagination object but with {meta, data} structure
 * @param result
 * @constructor
 */
export function PaginatedMetaData<T = any>(result: Paginated<T>): PaginatedMetaData<T> {
    const {data, ...meta} = result;
    return {meta, data};
}