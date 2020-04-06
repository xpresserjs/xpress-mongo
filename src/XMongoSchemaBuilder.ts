import XMongoDataType = require("./XMongoDataType");
import {ObjectID} from "mongodb";
import {StringToAnyObject} from "./CustomTypes";


const isString = (v: any) => typeof v === 'string';
const isBoolean = (v: any) => typeof v === 'boolean';
const isObject = (v: any) => (v && typeof v === 'object' && !Array.isArray(v));
const isObjectId = (v: any) => ObjectID.isValid(v);
const isArray = (v: any) => Array.isArray(v);
const isDate = (v: any) => v instanceof Date;
const isNumber = (v: any) => !isBoolean(v) && !isNaN(v);

type XMongoSchemaBuilder = {
    ObjectId: () => XMongoDataType,
    Array: { (def?: () => Array<any>): XMongoDataType },
    Object: { (def?: () => StringToAnyObject): XMongoDataType },
    String: { (def?: string): XMongoDataType },
    Boolean: { (def?: boolean): XMongoDataType },
    Date: { (def?: () => Date): XMongoDataType },
    Number: { (def?: 0): XMongoDataType },
    Types: { (types: XMongoDataType[]): XMongoDataType },
};

const is: XMongoSchemaBuilder = {
    /**
     * ObjectId
     * @return {XMongoDataType}
     */
    ObjectId: (): XMongoDataType => {
        return new XMongoDataType('ObjectId', undefined)
            .validator({
                or: [isString, isObjectId]
            })
            .cast((val, key) => {

                if (typeof val === "object" && ObjectID.isValid(val)) {
                    return val
                }

                try {
                    return new ObjectID(val);
                } catch (e) {
                    throw  TypeError(`(${key}) is not valid Mongodb-ObjectID`);
                }
            })
            .validatorError((key) => `(${key}) is not a Mongodb-ObjectID`);

    },

    /**
     * Array
     * @param def
     * @return {XMongoDataType}
     */
    Array: (def = () => []): XMongoDataType => {
        return new XMongoDataType('Array', def)
            .validator(isArray)
            .validatorError((key) => `(${key}) is not an Array`);
    },


    /**
     * Object
     * @param def
     * @return {XMongoDataType}
     */
    Object: (def = () => ({})): XMongoDataType => {
        return new XMongoDataType('Object', def)
            .validator(isObject)
            .validatorError((key) => `(${key}) is not an Object`);

    },

    /**
     * String
     * @param def
     * @return {XMongoDataType}
     */
    String: (def = undefined): XMongoDataType => {
        return new XMongoDataType('String', def)
            .validator(isString)
            .validatorError((key) => `(${key}) is not a String`);
    },

    /**
     * Boolean
     * @param def
     * @return {XMongoDataType}
     */
    Boolean: (def = false): XMongoDataType => {
        return new XMongoDataType('Boolean', def)
            .validator(isBoolean)
            .validatorError((key) => `(${key}) is not a Boolean`);

    },

    /**
     * Date
     * @param def
     * @return {XMongoDataType}
     */
    Date: (def = () => new Date()): XMongoDataType => {
        return new XMongoDataType('Date', def)
            .validator(isDate)
            .validatorError((key) => `(${key}) is not a Date`);
    },
    /**
     * Number
     * @param def
     * @return {XMongoDataType}
     */
    Number: (def = 0): XMongoDataType => {
        return new XMongoDataType('Number', def)
            .validator(isNumber)
            .cast((v) => Number(v))
            .validatorError((key) => `(${key}) is not a Number`);
    },

    /**
     * Is Multiple types
     * @param {XMongoDataType[]} types
     * @return {XMongoDataType}
     */
    Types: (types: XMongoDataType[]): XMongoDataType => {
        const multipleType = new XMongoDataType('MultipleDataTypes');
        const mainSchema = types[0].schema;

        // Set default function to first type default
        multipleType.default(mainSchema.default);

        // set validators
        const validators: any[] = [];
        let typeNames: (string[] | string) = [];
        let isRequired = false;

        for (const type of types) {
            validators.push(type.schema.validator);
            typeNames.push(type.schema.name);

            if (type.schema.required) isRequired = true;
        }

        // Set required if any type has required(true)
        if (isRequired) multipleType.required();

        // Set or to validators
        multipleType.validator({or: validators});

        // Set cast if main function has cast
        if (typeof mainSchema.cast === 'function') {
            multipleType.cast(mainSchema.cast);
        }

        // Join names to string
        typeNames = typeNames.join(', ');

        // Set Validation Error
        multipleType.validatorError(key => `${key} failed [${typeNames}] validations`);

        return multipleType;
    },
};


export {is, XMongoSchemaBuilder}