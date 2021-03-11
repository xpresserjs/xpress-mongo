import XMongoDataType = require("./XMongoDataType");
import { ObjectID } from "mongodb";
import { UuidOptions, XMongoSchemaBuilder } from "./CustomTypes";
// @ts-ignore
import uuid = require("uuid");

// Quick Functions
const isString = (v: any) => typeof v === "string";
const isBoolean = (v: any) => typeof v === "boolean";
const isObject = (v: any) => v && typeof v === "object" && !Array.isArray(v);
const isObjectId = (v: any) => ObjectID.isValid(v);
const isArray = (v: any) => Array.isArray(v);
const isDate = (v: any) => {
    if (v instanceof Date) {
        return true;
    } else if (typeof v === "string") {
        return !isNaN(new Date(v).getTime());
    } else {
        return false;
    }
};
const isNumber = (v: any) => !isBoolean(v) && !isNaN(v);

const is: XMongoSchemaBuilder = {
    /**
     * Accept any value passed through
     * @param def
     * @constructor
     */
    Any: (def: any): XMongoDataType => {
        return new XMongoDataType("Any", def).validator(() => true);
    },

    /**
     * Array
     * @param def
     * @return {XMongoDataType}
     */
    Array: (def = () => []): XMongoDataType => {
        return new XMongoDataType("Array", def)
            .validator(isArray)
            .validatorError((key) => `(${key}) is not an Array`);
    },

    /**
     * Boolean
     * @param def
     * @return {XMongoDataType}
     */
    Boolean: (def = false): XMongoDataType => {
        return new XMongoDataType("Boolean", def)
            .validator(isBoolean)
            .validatorError((key) => `(${key}) is not a Boolean`);
    },

    /**
     * Custom validator
     * @param validator
     * @param error
     * @constructor
     */
    CustomValidator(
        validator: (value: any) => boolean,
        error?: string | { (key: string): string }
    ): XMongoDataType {
        const newValidator = new XMongoDataType("CustomValidator").validator(validator);

        if (error) {
            if (typeof error === "string") error = () => <string>error;
            newValidator.validatorError(error);
        }

        return newValidator;
    },

    /**
     * Date
     * @param def
     * @return {XMongoDataType}
     */
    Date: (def = () => new Date()): XMongoDataType => {
        return new XMongoDataType("Date", def)
            .validator(isDate)
            .cast((value) => {
                if (value instanceof Date) {
                    return value;
                } else {
                    return new Date(value);
                }
            })
            .validatorError((key) => `(${key}) is not a Date`);
    },

    /**
     * InArray
     * @param list
     * @param def
     * @constructor
     */
    InArray(list: any[], def?: any): XMongoDataType {
        return new XMongoDataType("InArray", def)
            .validator((value) => list.includes(value))
            .validatorError((key) => `(${key}) is not included in ${JSON.stringify(list)}`);
    },

    /**
     * Number
     * @param def
     * @return {XMongoDataType}
     */
    Number: (def = 0): XMongoDataType => {
        // if array return inArray
        // noinspection SuspiciousTypeOfGuard
        if (typeof def !== "number" && Array.isArray(def)) return is.InArray(def).name("Number");

        return new XMongoDataType("Number", def)
            .validator(isNumber)
            .cast((v) => Number(v))
            .validatorError((key) => `(${key}) is not a Number`);
    },

    /**
     * Object
     * @param def
     * @return {XMongoDataType}
     */
    Object: (def = () => ({})): XMongoDataType => {
        return new XMongoDataType("Object", def)
            .validator(isObject)
            .validatorError((key) => `(${key}) is not an Object`);
    },

    /**
     * ObjectId
     * @return {XMongoDataType}
     */
    ObjectId: (): XMongoDataType => {
        return new XMongoDataType("ObjectId", undefined)
            .validator({
                or: [isString, isObjectId]
            })
            .cast((val, key) => {
                if (typeof val === "object" && ObjectID.isValid(val)) {
                    return val;
                }

                try {
                    return new ObjectID(val);
                } catch (e) {
                    throw TypeError(`(${key}) is not valid Mongodb-ObjectID`);
                }
            })
            .validatorError((key) => `(${key}) is not a Mongodb-ObjectID`);
    },

    /**
     * String
     * @param def
     * @return {XMongoDataType}
     */
    String: (def = undefined): XMongoDataType => {
        // if array return inArray
        if (def && typeof def !== "string" && Array.isArray(def))
            return is.InArray(def).name("String");

        return new XMongoDataType("String", def)
            .validator(isString)
            .validatorError((key) => `(${key}) is not a String`);
    },

    /**
     * Is Multiple types
     * @param {XMongoDataType[]} types
     * @return {XMongoDataType}
     */
    Types: (types: XMongoDataType[]): XMongoDataType => {
        const multipleType = new XMongoDataType("MultipleDataTypes");
        const mainSchema = types[0].schema;

        // Set default function to first type default
        multipleType.default(mainSchema.default);

        // set validators
        const validators: any[] = [];
        let typeNames: string[] | string = [];
        let isRequired = false;

        for (const type of types) {
            validators.push(type.schema.validator);
            typeNames.push(type.schema.name);

            if (type.schema.required) isRequired = true;
        }

        // Set required if any type has required(true)
        if (isRequired) multipleType.required();

        // Set or to validators
        multipleType.validator({ or: validators });

        // Set cast if main function has cast
        if (typeof mainSchema.cast === "function") {
            multipleType.cast(mainSchema.cast);
        }

        // Join names to string
        typeNames = typeNames.join(", ");

        // Set Validation Error
        multipleType.validatorError((key) => `${key} failed [${typeNames}] validations`);

        return multipleType;
    },

    /**
     * Uuid
     * @param version - version of uuid
     * @param options - options of uuid version 3 or 5
     */
    Uuid: (version: 1 | 3 | 4 | 5 | number = 4, options?: UuidOptions): XMongoDataType => {
        if (![1, 3, 4, 5].includes(version)) {
            throw Error("Uuid version argument expects 1, 3, 4 or 5!");
        }

        if ([3, 5].includes(version) && !options) {
            throw Error(`Uuid version (${version}) requires {name, namespace} options!`);
        }

        return new XMongoDataType("Uuid")
            .validator((value) => uuid.validate(value))
            .default(() => {
                switch (version) {
                    case 1:
                        return uuid.v1();
                    case 3:
                        return uuid.v3(
                            (options as UuidOptions).name,
                            (options as UuidOptions).namespace
                        );
                    case 4:
                        return uuid.v4();
                    case 5:
                        return uuid.v5(
                            (options as UuidOptions).name,
                            (options as UuidOptions).namespace
                        );
                }
            });
    }
};

export = is;
