export interface PaginatedMeta {
    total: number;
    perPage: number;
    page: number;
    lastPage: number;
}

export interface Paginated<T = any> extends PaginatedMeta {
    data: T[];
}

export function Paginated<T>(): Paginated<T> {
    return {
        total: 0,
        perPage: 0,
        page: 1,
        lastPage: 1,
        data: [] as T[]
    };
}