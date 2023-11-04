import XMongoModel from "./XMongoModel";
import { StringToAnyObject } from "./types/index";
import { UpdateOptions, UpdateResult } from "mongodb";

class XMongoTypedModel<DT extends StringToAnyObject = StringToAnyObject> extends XMongoModel {
    // Set this.data type to DT
    declare data: DT;

    // Set this.set() key to accept DT keys.
    declare set: (key: string | keyof DT, value: any) => this;

    // Set this.setMany() key to accept DT keys.
    declare setMany: (fields: Record<keyof DT | string, any>) => this;

    // Set this.get() key to accept DT keys.
    declare get: <T = unknown>(key: keyof DT | string, $default?: any) => T;

    // Set this.has() key to accept DT keys.
    declare has: (key: keyof DT | string, value: any) => boolean;

    // Set this.update() to use DT keys
    declare update: (
        set: Record<keyof DT | string, any>,
        options?: UpdateOptions
    ) => Promise<UpdateResult>;

    /**
     * -----------------------
     * Custom Functions.
     *
     * These functions only exists in XMongoTypedModel.
     * -----------------------
     */

    /**
     * SetTyped is same as `set` but will throw error at compile time
     * if key used does not exist in schema.
     * @param key
     * @param value
     */
    setTyped<Value = any>(key: keyof DT, value: Value) {
        return this.set(key, value);
    }

    /**
     * setManyTyped is same as `setMany` but will throw error at compile time if key used does not exist in schema.
     * @param fields
     */
    setManyTyped(fields: Record<keyof DT, any>) {
        return this.setMany(fields);
    }

    /**
     * hasTyped is same as `has` but will throw error at compile time
     * if key used does not exist in schema.
     * @param key
     * @param value
     */
    hasTyped(key: keyof DT | string, value?: any) {
        return this.has(key, value);
    }

    /**
     * getTyped is same as `get` but will throw error at compile time
     * if key used does not exist in schema.
     * @param key
     * @param $default
     */
    getTyped<T = unknown>(key: keyof DT | string, $default?: any): T {
        return this.get<T>(key, $default);
    }

    /**
     * updateTyped is same as `update` but will throw error at compile time
     * if key used does not exist in schema.
     * @param set
     * @param options
     */
    updateTyped(set: Record<keyof DT, any>, options?: UpdateOptions): Promise<UpdateResult> {
        return this.update(set as any, options);
    }
}

export default XMongoTypedModel;
