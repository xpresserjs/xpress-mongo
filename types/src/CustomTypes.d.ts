export declare type FunctionReturnsBoolean = (...args: any[]) => boolean;
export declare type FunctionReturnsVoidOrBoolean = (...args: any[]) => (boolean | void);
export declare type CastFunctionType = (value: any, key?: string) => any;
export declare type ValidatorType = FunctionReturnsVoidOrBoolean | {
    or?: Array<FunctionReturnsBoolean>;
    and?: Array<FunctionReturnsBoolean>;
};
export declare type SchemaPropertiesType = {
    name: string;
    default?: any;
    validator: ValidatorType;
    validationError: (key: string) => string;
    required: boolean;
    cast: CastFunctionType | null;
};
export declare type StringToAnyObject = {
    [key: string]: any;
};
export declare type PaginationData = {
    total: number;
    perPage: number;
    page: number;
    lastPage: number;
    data: any[];
};
