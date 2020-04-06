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