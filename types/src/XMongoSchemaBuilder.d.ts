import ModelDataType from "./XMongoDataType";
import { StringToAnyObject } from "./CustomTypes";
declare type XMongoSchemaBuilder = {
    ObjectId: () => ModelDataType;
    Array: {
        (def?: () => Array<any>): ModelDataType;
    };
    Object: {
        (def?: () => StringToAnyObject): ModelDataType;
    };
    String: {
        (def?: string): ModelDataType;
    };
    Boolean: {
        (def?: boolean): ModelDataType;
    };
    Date: {
        (def?: () => Date): ModelDataType;
    };
    Number: {
        (def?: 0): ModelDataType;
    };
    Types: {
        (types: ModelDataType[]): ModelDataType;
    };
};
declare const is: XMongoSchemaBuilder;
export { is, XMongoSchemaBuilder };
