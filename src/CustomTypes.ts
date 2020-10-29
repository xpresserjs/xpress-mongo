import XMongoDataType = require("./XMongoDataType");

export type FunctionReturnsBoolean = (...args: any[]) => boolean;
export type FunctionReturnsVoidOrBoolean = (...args: any[]) => (boolean | void);
export type CastFunctionType = (value: any, key?: string) => any;

export type ValidatorType = FunctionReturnsVoidOrBoolean | {
    or?: Array<FunctionReturnsBoolean>,
    and?: Array<FunctionReturnsBoolean>
};


export type SchemaPropertiesType = {
    name: string,
    default?: any,
    validator: ValidatorType
    validationError: (key: string) => string,
    required: boolean,
    cast: CastFunctionType | null
}

export type StringToAnyObject = { [key: string]: any }

export type PaginationData = {
    total: number,
    perPage: number,
    page: number,
    lastPage: number,
    data: any[]
};

type InputBuffer = ArrayLike<number>;
export type UuidOptions = {
    name: string | InputBuffer,
    namespace: string | InputBuffer
};

export type XMongoSchemaBuilder = {
    Array(def?: () => Array<any>): XMongoDataType
    Boolean(def?: boolean): XMongoDataType
    CustomValidator(
        validator: (value: any) => boolean,
        error?: string | { (key: string): string }
    ): XMongoDataType
    Date(def?: () => Date): XMongoDataType
    InArray(list: any[], def?: any): XMongoDataType
    Number(def?: number | number[]): XMongoDataType
    Object(def?: () => StringToAnyObject): XMongoDataType
    ObjectId(): XMongoDataType
    String(def?: string | string[]): XMongoDataType
    Types(types: XMongoDataType[]): XMongoDataType
    Uuid(version: number, options?: UuidOptions): XMongoDataType
}