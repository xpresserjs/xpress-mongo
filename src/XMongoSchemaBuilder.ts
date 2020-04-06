import ModelDataType from "./XMongoDataType";
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
    ObjectId: () => ModelDataType,
    Array: { (def?: () => Array<any>): ModelDataType },
    Object: { (def?: () => StringToAnyObject): ModelDataType },
    String: { (def?: string): ModelDataType },
    Boolean: { (def?: boolean): ModelDataType },
    Date: { (def?: () => Date): ModelDataType },
    Number: { (def?: 0): ModelDataType },
    Types: { (types: ModelDataType[]): ModelDataType },
};

const is: XMongoSchemaBuilder = {
    /**
     * ObjectId
     * @return {ModelDataType}
     */
    ObjectId: () => {
        return new ModelDataType('ObjectId', undefined)
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
     * @return {ModelDataType}
     */
    Array: (def = () => []) => {
        return new ModelDataType('Array', def)
            .validator(isArray)
            .validatorError((key) => `(${key}) is not an Array`);
    },


    /**
     * Object
     * @param def
     * @return {ModelDataType}
     */
    Object: (def = () => ({})) => {
        return new ModelDataType('Object', def)
            .validator(isObject)
            .validatorError((key) => `(${key}) is not an Object`);

    },

    /**
     * String
     * @param def
     * @return {ModelDataType}
     */
    String: (def = undefined) => {
        return new ModelDataType('String', def)
            .validator(isString)
            .validatorError((key) => `(${key}) is not a String`);
    },

    /**
     * Boolean
     * @param def
     * @return {ModelDataType}
     */
    Boolean: (def = false) => {
        return new ModelDataType('Boolean', def)
            .validator(isBoolean)
            .validatorError((key) => `(${key}) is not a Boolean`);

    },

    /**
     * Date
     * @param def
     * @return {ModelDataType}
     */
    Date: (def = () => new Date()) => {
        return new ModelDataType('Date', def)
            .validator(isDate)
            .validatorError((key) => `(${key}) is not a Date`);
    },
    /**
     * Number
     * @param def
     * @return {ModelDataType}
     */
    Number: (def = 0) => {
        return new ModelDataType('Number', def)
            .validator(isNumber)
            .cast((v) => Number(v))
            .validatorError((key) => `(${key}) is not a Number`);
    },

    /**
     * Is Multiple types
     * @param {ModelDataType[]} types
     * @return {ModelDataType}
     */
    Types: (types: ModelDataType[]) => {
        const multipleType = new ModelDataType('MultipleDataTypes');
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