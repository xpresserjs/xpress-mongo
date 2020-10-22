import XMongoDataType = require("./XMongoDataType");
import { StringToAnyObject } from "./CustomTypes";
declare type InputBuffer = ArrayLike<number>;
declare type UuidOptions = {
    name: string | InputBuffer;
    namespace: string | InputBuffer;
};
declare type XMongoSchemaBuilder = {
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
declare const is: XMongoSchemaBuilder;
export { is, XMongoSchemaBuilder };
