import XMongoDataType = require("./XMongoDataType");
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
declare type InputBuffer = ArrayLike<number>;
export declare type UuidOptions = {
    name: string | InputBuffer;
    namespace: string | InputBuffer;
};
export declare type XMongoSchemaBuilder = {
    Array(def?: () => Array<any>): XMongoDataType;
    Boolean(def?: boolean): XMongoDataType;
    CustomValidator(validator: (value: any) => boolean, error?: string | {
        (key: string): string;
    }): XMongoDataType;
    Date(def?: () => Date): XMongoDataType;
    InArray(list: any[], def?: any): XMongoDataType;
    Number(def?: number | number[]): XMongoDataType;
    Object(def?: () => StringToAnyObject): XMongoDataType;
    ObjectId(): XMongoDataType;
    String(def?: string | string[]): XMongoDataType;
    Types(types: XMongoDataType[]): XMongoDataType;
    Uuid(version: number, options?: UuidOptions): XMongoDataType;
};
export {};
