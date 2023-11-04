import {
    FunctionReturnsBoolean,
    SchemaPropertiesType,
    StringToAnyObject,
    ValidatorType
} from "../src/types/index";
import XMongoModel from "../src/XMongoModel";
import _ from "object-collection/lodash";
import { watch } from "fs";
import Joi from "joi";
import { XMongoDataType } from "../index";
import { DoNothing } from "./helpers";

/**
 * Get Default value.
 *
 * @description
 * In a situation where default value is an object, it is called to get the real default value.
 * @example
 * is.Date() default value is a function that needs to be executed to get the current date at the execution time.
 *
 * @returns {*}
 * @param data
 */
export function defaultValue(data: SchemaPropertiesType): any {
    // Return undefined if no default property in data.
    if (!data || (data && !data.hasOwnProperty("default"))) return undefined;

    // Run and return default function data.
    if (typeof data["default"] === "function") return data.default();

    // return default value.
    return data.default;
}

/**
 * RunOrValidation
 * @description
 * Run validators and stop if any is true
 * @param {*} value
 * @param {ValidatorType[]} validators
 * @return {boolean}
 */
export function runOrValidation(
    value: any,
    validators: ValidatorType[] | FunctionReturnsBoolean[]
): boolean {
    for (const validator of validators) {
        if (typeof validator === "function" && validator(value) === true) {
            return true;
        } else if (typeof validator === "object" && validator.hasOwnProperty("or")) {
            if (runOrValidation(value, <FunctionReturnsBoolean[]>validator["or"])) {
                return true;
            }
        }
    }

    return false;
}

/**
 * RunAndValidation
 * @description
 * Run validators and stop if any is false
 * @param {*} value
 * @param {[]} validators
 * @return {boolean}
 */
export function runAndValidation(
    value: any,
    validators: ValidatorType[] | FunctionReturnsBoolean[]
): boolean {
    for (const validator of validators) {
        if (typeof validator === "function" && validator(value) === true) return false;
    }

    return true;
}

export function RunInBackground<T = any>(fn: () => void) {
    /**
     * The `then` of promises are always asynchronous.
     * This above with setTimout & setImmediate, we are sure this will run in background.
     * without interfering the current process.
     */
    return (
        new Promise<void>((resolve) => setImmediate(resolve))
            // Run function in setImmediate
            .then(fn)
            // catch Errors
            .catch(console.log)
    );
}

export async function RunOnEvent(
    event: string,
    modelInstance: XMongoModel,
    changes?: StringToAnyObject
): Promise<any> {
    // Get Model
    const Model = modelInstance.constructor as typeof XMongoModel;

    // if model does not have events defined, return false.
    if (!Model.events) return false;

    // Get events from Model
    let events = Model.events;
    // Check if events has defined 'event'
    if (!events[event]) return false;

    // Get Event
    let thisEvent = events[event];

    /**
     * if event is watch and no fields in 'changes' object, return false.
     */
    if (event === "watch" && changes && !Object.keys(changes).length) return false;

    /**
     * if type of event === function
     *
     * Function: All
     * Object: events that targets fields
     */
    if (typeof thisEvent === "function") {
        if (["watch", "created", "deleted"].includes(event)) {
            RunInBackground(() => thisEvent(modelInstance)).finally(DoNothing);
        } else {
            await thisEvent(modelInstance);
        }
    } else if (typeof thisEvent === "object") {
        const fields = Object.keys(thisEvent);

        for (const field of fields) {
            if (event === "watch") {
                if (_.has(changes, field)) {
                    RunInBackground(() => thisEvent[field](modelInstance)).finally(DoNothing);
                }
            } else {
                // else it is `update` or `create`
                const newFieldValue = await thisEvent[field](modelInstance);
                if (newFieldValue !== undefined) {
                    modelInstance.set(field, newFieldValue);
                }
            }
        }
    }

    return false;
}

/**
 * Process schema
 * @param schema
 * @param fieldName
 */
export function processSchema(
    schema: XMongoDataType | Joi.Schema,
    fieldName: string
): XMongoDataType {
    if (Joi.isSchema(schema)) {
        // Covert Joi to XMongoDataType
        schema = (schema as Joi.Schema).label(fieldName);
        schema = new XMongoDataType("Joi").joi(schema);
    }

    return schema as XMongoDataType;
}
