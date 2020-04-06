import XMongoDataType = require("./XMongoDataType");
import { StringToAnyObject } from "./CustomTypes";
declare type XMongoSchemaBuilder = {
    ObjectId: () => XMongoDataType;
    Array: {
        (def?: () => Array<any>): XMongoDataType;
    };
    Object: {
        (def?: () => StringToAnyObject): XMongoDataType;
    };
    String: {
        (def?: string): XMongoDataType;
    };
    Boolean: {
        (def?: boolean): XMongoDataType;
    };
    Date: {
        (def?: () => Date): XMongoDataType;
    };
    Number: {
        (def?: 0): XMongoDataType;
    };
    Types: {
        (types: XMongoDataType[]): XMongoDataType;
    };
};
declare const is: XMongoSchemaBuilder;
export { is, XMongoSchemaBuilder };
