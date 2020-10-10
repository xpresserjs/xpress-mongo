import XMongoDataType = require("./XMongoDataType");
import { StringToAnyObject } from "./CustomTypes";
declare type InputBuffer = ArrayLike<number>;
declare type UuidOptions = {
    name: string | InputBuffer;
    namespace: string | InputBuffer;
};
interface XMongoSchemaBuilder {
    ObjectId(): XMongoDataType;
    Uuid(version: number, options?: UuidOptions): XMongoDataType;
    Array(def?: () => Array<any>): XMongoDataType;
    Object(def?: () => StringToAnyObject): XMongoDataType;
    String(def?: string): XMongoDataType;
    Boolean(def?: boolean): XMongoDataType;
    Date(def?: () => Date): XMongoDataType;
    Number(def?: 0): XMongoDataType;
    Types(types: XMongoDataType[]): XMongoDataType;
}
declare const is: XMongoSchemaBuilder;
export { is, XMongoSchemaBuilder };
