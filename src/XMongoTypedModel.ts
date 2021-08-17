import XMongoModel from "./XMongoModel";
import { StringToAnyObject } from "./CustomTypes";
import { UpdateOptions, UpdateResult } from "mongodb";

class XMongoTypedModel<DT = Record<string, any>> extends XMongoModel {
    // Set this.data type to DT
    declare data: DT;

    // Set this.set() key to accept DT keys.
    declare set: (
        key: string | keyof DT | StringToAnyObject | Record<keyof DT | string, any>,
        value?: any
    ) => this;

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
     * if key used does not exists in schema.
     * @param key
     * @param value
     */
    setTyped(key: keyof DT | Record<keyof DT, any>, value?: any) {
        return this.set(key as string, value);
    }

    /**
     * hasTyped is same as `has` but will throw error at compile time
     * if key used does not exists in schema.
     * @param key
     * @param value
     */
    hasTyped(key: keyof DT | string, value?: any) {
        return this.has(key, value);
    }

    /**
     * getTyped is same as `get` but will throw error at compile time
     * if key used does not exists in schema.
     * @param key
     * @param $default
     */
    getTyped<T = unknown>(key: keyof DT | string, $default?: any): T {
        return this.get<T>(key, $default);
    }

    /**
     * updateTyped is same as `update` but will throw error at compile time
     * if key used does not exists in schema.
     * @param set
     * @param options
     */
    updateTyped(set: Record<keyof DT, any>, options?: UpdateOptions): Promise<UpdateResult> {
        return this.update(set as any, options);
    }
}

export = XMongoTypedModel;
