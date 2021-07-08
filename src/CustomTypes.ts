import XMongoDataType = require("./XMongoDataType");
import XMongoModel from "./XMongoModel";
import Joi from "joi";

export type FunctionReturnsBoolean = (...args: any[]) => boolean;
export type FunctionReturnsVoidOrBoolean = (...args: any[]) => boolean | void;
export type CastFunctionType = (value: any, key?: string) => any;
export type RequiredIf = <T extends XMongoModel>(modelInstance: T) => boolean;

export type ValidatorType =
    | FunctionReturnsVoidOrBoolean
    | {
          or?: Array<FunctionReturnsBoolean>;
          and?: Array<FunctionReturnsBoolean>;
      };

export type UseJoi = (joi: Joi.Root) => Joi.Schema;

export type SchemaPropertiesType = {
    name: string;
    default?: any;
    validator: ValidatorType | Joi.Schema;
    validationError: (key: string) => string;
    required: boolean | RequiredIf;
    cast: CastFunctionType | null;
    isJoi?: boolean;
    isUnique?: boolean;
    uniqueQuery?: {
        query?: FnWithArg<any, Record<string, any>>;
        // replaceWith?: FnWithArg;
    };
};

export type StringToAnyObject = Record<string, any>;

export type PaginationData = {
    total: number;
    perPage: number;
    page: number;
    lastPage: number;
    data: any[];
};

type InputBuffer = ArrayLike<number>;
export type UuidOptions = {
    name: string | InputBuffer;
    namespace: string | InputBuffer;
};

export type XMongoSchemaBuilder = {
    Any(def?: any | (() => any)): XMongoDataType;
    Array(def?: () => Array<any>): XMongoDataType;
    Boolean(def?: boolean | (() => boolean)): XMongoDataType;
    CustomValidator(
        validator: (value: any) => boolean,
        error?: string | { (key: string): string }
    ): XMongoDataType;
    Date(def?: () => Date): XMongoDataType;
    InArray(list: any[], def?: any): XMongoDataType;
    Number(def?: number | number[] | (() => number | number[])): XMongoDataType;
    Object(def?: () => StringToAnyObject): XMongoDataType;
    ObjectId(): XMongoDataType;
    String(def?: string | string[] | (() => string | string[])): XMongoDataType;
    Types(types: XMongoDataType[]): XMongoDataType;
    Uuid(version: number, options?: UuidOptions): XMongoDataType;
};

export type XMongoSchema<DataType = any> = Record<keyof DataType, XMongoDataType | Joi.Schema>;
export type XMongoSchemaFn = (is: XMongoSchemaBuilder, Joi: Joi.Root) => XMongoSchema;
export type XMongoStrictConfig = undefined | boolean | { removeNonSchemaFields?: boolean };

export type FnWithArg<arg = any, result = any> = (c: arg) => result;
