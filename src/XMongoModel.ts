import ObjectCollection = require("object-collection");
import XMongoDataType = require("./XMongoDataType");

import {
    AggregateOptions,
    AggregationCursor,
    Collection,
    DeleteResult,
    Filter,
    FindCursor,
    FindOptions,
    InsertOneOptions,
    InsertOneResult,
    ObjectId,
    UpdateFilter,
    UpdateOptions,
    UpdateResult
} from "mongodb";

import is from "./SchemaBuilder";
import {diff} from "deep-object-diff";
import {defaultValue, processSchema, runAndValidation, RunOnEvent, runOrValidation} from "../fn/inbuilt";
import {
    PaginationData,
    SchemaPropertiesType,
    StringToAnyObject,
    XMongoSchema,
    XMongoSchemaFn,
    XMongoStrictConfig
} from "./CustomTypes";
import Joi from "joi";
import _ from "object-collection/lodash";

/**
 * Get Lodash
 */
// const _ = ObjectCollection.getLodash();

type FunctionWithRawArgument = (raw: Collection) => FindCursor | AggregationCursor;

/**
 * @class
 */
class XMongoModel {
    /**
     * Model Data
     * @type {*}
     */
    public data: StringToAnyObject = {};

    /**
     * Model Data
     * @type {ObjectCollection}
     */
    public $data: ObjectCollection | undefined;

    /**
     * Model Original Data
     * @type {*}
     */
    private original: StringToAnyObject = {};

    /**
     * Model Schema
     * @private
     * @type {{}}
     */
    public schema: StringToAnyObject = {};

    /**
     * Model Schema
     * @private
     * @type {{}}
     */
    public static schema: XMongoSchema;

    /**
     * Model Events
     */
    public static events: StringToAnyObject;

    /**
     * Strict
     */
    public static strict: XMongoStrictConfig;

    /**
     * Model Schema Store
     * @private
     * @type {{}}
     */
    public schemaStore: StringToAnyObject = {};

    /**
     * Model meta
     * @private
     */
    private meta!: {
        /**
         * Source of truth to check if schema was loaded
         */
        hasLoadedSchema?: string | boolean;
        hasUniqueSchema?: false | string[];
        usingCustomId?: false | ObjectId;
        findQuery?: Record<string, any>;
    };

    /**
     * Defined relationships
     * @type {{}}
     */
    static relationships: {
        [relationship: string]: {
            type: string;
            model: typeof XMongoModel | [() => typeof XMongoModel];
            where: Record<string, any>;
            options?: Record<string, any>;
        };
    };

    /** Model Loaded Relationships
     * @private
     * @type {*[]}
     */
    private loadedRelationships: string[] = [];

    /**
     * Direct mongodb access
     * @type {string[]}
     */
    static append: string[];

    /**
     * Model Constructor
     *
     * The model constructor only initializes `this.action`
     * and passes a function that returns `this.data` to the `ModelActions` class.
     *
     * The ModelAction class uses this function to access this models data.
     */
    constructor(setUpSchema = true) {
        // Assume data is empty
        this.$emptyData();

        Object.defineProperty(this, "meta", {
            value: {},
            writable: true,
            enumerable: false
        });

        Object.defineProperty(this, "schema", {
            value: {},
            writable: true,
            enumerable: false,
            configurable: true
        });

        Object.defineProperty(this, "original", {
            value: {},
            writable: true,
            enumerable: false
        });

        Object.defineProperty(this, "schemaStore", {
            value: {},
            writable: true,
            enumerable: false
        });

        Object.defineProperty(this, "loadedRelationships", {
            value: [],
            writable: true,
            enumerable: false
        });

        if (setUpSchema) {
            /**
             * Set Model Schema if exists
             */
            const thisClass = this.$static();
            if (thisClass.schema) {
                this.$useSchema(thisClass.schema);
            }
        }
    }

    /**
     * Use `.native()` instead
     * @deprecated since (v 0.0.40)
     * @remove at (v 1.0.0)
     */
    static thisCollection(): Collection {
        // @ts-ignore
        return null;
    }

    /**
     * Returns native mongodb instance to run native queries.
     *
     * Because this is
     */
    static native(): Collection<any> {
        const part = this.name ? `Model: {${this.name}}` : "Model";
        // @ts-ignore
        throw new Error(`Cannot access .native(), Link ${part} to a collection first.`);
    }

    /**
     * Empties data in current model.
     * @param replaceWith
     * @returns {this}
     */
    $emptyData(replaceWith?: StringToAnyObject): this {
        const _id = this.id();

        /**
         * if _id exists then add it.
         */
        if (_id) {
            this.data = { _id };
        } else {
            this.data = {};
        }

        if (replaceWith && typeof replaceWith === "object")
            this.data = { ...this.data, ...replaceWith };

        return this;
    }

    /**
     * Get Data in model
     * @param key
     * @param $default
     * @return {*|undefined}
     */
    get(key: string, $default?: any): any {
        return _.get(this.data, key, $default);
    }

    /**
     * Set data in model
     * @param key
     * @param value
     * @return {this}
     */
    set(key: string | Record<string, any>, value?: any): this {
        if (typeof key === "object" && value === undefined) {
            for (const property in key) {
                _.set(this.data, property, key[property]);
            }
        } else if (typeof key === "string") {
            _.set(this.data, key, value);
        }
        return this;
    }

    /**
     * Check if field exists in data
     * if value is defined, it checks if the value is the defined value.
     * if value is a function, its returned value is used.
     * @param key
     * @param value
     */
    has(key: string, value: any | (() => any) = undefined): boolean {
        const has = _.has(this.data, key);

        if (has && value !== undefined) {
            const realValue = this.get(key);
            if (typeof value === "function") {
                value = value();
            }

            return realValue === value;
        }

        return has;
    }

    /**
     * Push element to model
     * @param key
     * @param value
     * @param strict
     * @return {this}
     */
    pushToArray(key: string, value: any, strict: boolean = false): this {
        // Find current value of key
        let data: any[] = this.get(key, undefined);

        // if current value is undefined create new array
        if (data === undefined) {
            data = [];
        }

        // Else if not array we throw an error
        else if (!Array.isArray(data)) {
            throw Error(`PushTo: Current value of {${key}} is not an array.`);
        }

        // Else if strict and value already exists.
        else if (strict && data.includes(value)) {
            return this;
        }

        // push value to array
        data.push(value);

        // Set data to model
        this.set(key, data);

        // Return this.
        return this;
    }

    /**
     * Find data in array
     * @param key
     * @param value
     */
    findInArray(key: string, value: any): any {
        // Get data value
        const data = this.get(key, undefined);
        // Return undefined of value is undefined
        if (data === undefined) return data;
        // Find in data
        return _.find(data, value);
    }

    /**
     * Insert new record and return instance.
     * @param data - new record data.
     * @param save - Save new date, default = true
     * @return {Promise<this|*>}
     */
    static async new<T extends typeof XMongoModel>(
        this: T,
        data: StringToAnyObject,
        save = true
    ): Promise<InstanceType<T>> {
        const record = this.make(data);
        if (save) await record.save();
        return record;
    }

    /**
     * Creates instance.
     * @desc
     * Just like .new but unlike .new it does not save the record to the database it to the database
     * @param data - new record data.
     * @return {Promise<this|*>}
     */
    static make<T extends typeof XMongoModel>(this: T, data: StringToAnyObject): InstanceType<T> {
        return new this().set(data) as InstanceType<T>;
    }

    /**
     * Check if id is a valid id
     * @param id
     * @return {boolean}
     */
    static isValidId(id: any): boolean {
        const isMongoID = ObjectId.isValid(id);

        /**
         * referring to this StackOverflow post
         * https://stackoverflow.com/questions/13850819/can-i-determine-if-a-string-is-a-mongodb-objectid
         *
         * ObjectId.isValid returns true on any 12 length string
         *
         * So converting to objectID and checking if the string value matches the original value
         * makes the check strict
         */
        if (isMongoID && typeof id === "string") {
            return new ObjectId(id).toString() === id;
        }

        return isMongoID;
    }

    /**
     * Set Original result gotten from db
     * @param data
     * @return {this}
     */
    private $setOriginal(data: StringToAnyObject): this {
        data = _.cloneDeep(data);

        Object.defineProperty(this, "original", {
            value: data,
            writable: true,
            enumerable: false
        });

        return this;
    }

    /**
     * Set multiple schemas and use them at anytime using `.setSchema`
     * @param {string} name
     * @param {Object} schema
     * @return {this}
     */
    $addSchema(name: string, schema: StringToAnyObject): this {
        // Save to schemaStore
        this.schemaStore[name] = schema;
        return this;
    }

    /**
     * Set Model Schema
     *
     * if `schema` is undefined then `this.data` is used as schema object
     * @param {Object|String} schema
     * @param modifyData
     * @returns {this}
     */
    $useSchema(
        schema?: string | StringToAnyObject | XMongoSchemaFn,
        modifyData: boolean = true
    ): this {
        if (!schema) schema = this.$static().schema;
        // Try to find schema from .schemaStore if string
        if (typeof schema === "string") {
            if (!this.schemaStore.hasOwnProperty(schema)) {
                throw Error(`schemaStore does not have schema named: ${schema}`);
            }

            // Empty Data to remove any predefined schemas
            if (!Object.keys(this.original).length) {
                this.$emptyData();
            }

            schema = this.schemaStore[schema] || {};
        }

        const newData: StringToAnyObject = { _id: this.id() };

        // If schema is a function then call it and pass is.
        if (typeof schema === "function") {
            schema = schema(is, Joi);
        }

        if (typeof schema === "object") {
            for (const field in schema) {
                if (schema.hasOwnProperty(field)) {
                    let schemaVal: XMongoDataType = processSchema(schema[field], field);
                    this.schema[field] = schemaVal["schema"];

                    if (modifyData) {
                        // Attach default values
                        const value = this.data[field] || defaultValue(this.schema[field]);
                        /**
                         * If default value is undefined and schema is required set field to undefined.
                         * else set field to value.
                         *
                         * This removes not required keys with undefined values.
                         */
                        if (value === undefined) {
                            if (schemaVal.schema.required) {
                                newData[field] = value;
                            }
                        } else {
                            newData[field] = value;
                        }
                    }

                    if (schemaVal.schema.isUnique) {
                        if (this.meta.hasUniqueSchema) {
                            this.meta.hasUniqueSchema.push(field);
                        } else {
                            this.meta.hasUniqueSchema = [field];
                        }
                    }
                }
            }
        }

        if (modifyData) {
            /**
             * Fill up keys defined in data but not in schema
             */
            for (const key in this.data) {
                // noinspection JSUnfilteredForInLoop
                if (!newData.hasOwnProperty(key)) {
                    // noinspection JSUnfilteredForInLoop
                    newData[key] = this.data[key];
                }
            }

            this.data = newData;
        }

        this.meta.hasLoadedSchema = true;

        return this;
    }

    /**
     * Get id of current model instance
     * @returns {*|ObjectId|null}
     */
    id(): ObjectId {
        const id = (this.data && this.data["_id"]) || null;

        if (typeof id === "string") return this.$static().id(id) as ObjectId;

        return id;
    }

    /**
     * Use custom _id
     * @param _id
     */
    useId(_id: ObjectId | string) {
        this.meta.usingCustomId = this.$static().id(_id);
        this.set("_id", this.meta.usingCustomId);

        return this;
    }

    /**
     * Generate _id for this instance if none exists.
     */
    generateId() {
        if (!this.id()) {
            this.useId(new ObjectId());
        }

        return this;
    }

    /**
     * Compare model id with a string or ObjectId type variable.
     * @param to
     * @param key
     * @returns {boolean}
     */
    idEqualTo(to: any, key = "_id"): boolean {
        /**
         * Get Value to be compared with
         * @type {ObjectId|string}
         */
        let compareWith = this.get(key, undefined);

        // Return false of to || compareWith is false, undefined or null
        if (!to || !compareWith) return false;

        /**
         * If to || compareWith is typeof objectID, we run toString() get the string value.
         */
        if (ObjectId.isValid(to)) to = to.toString();
        if (ObjectId.isValid(compareWith)) compareWith = compareWith.toString();

        // Compare Strings
        return to === compareWith;
    }

    /**
     * See changes made so far.
     * @return {*}
     */
    changes(): StringToAnyObject {
        const changes = diff(this.original, this.data);
        const data: StringToAnyObject = {};
        // @ts-ignore
        const append = this.constructor.append || [];
        const excluded = [...append, ...this.loadedRelationships];

        for (const key in changes) {
            if (!excluded.includes(key)) {
                data[key] = this.data[key];
            }
        }

        return data;
    }

    /**
     * Checks of current instance has changes.
     * @return {boolean}
     */
    hasChanges(): boolean {
        return Object.keys(this.changes()).length > 0;
    }

    /**
     * Check if a field or fields has changed
     * @param keys
     */
    hasChanged(keys: string | string[]): boolean {
        const changed = Object.keys(this.changes());

        if (!changed.length) return false;

        if (typeof keys === "string") {
            return changed.includes(keys);
        } else if (Array.isArray(keys)) {
            return keys.every((key) => changed.includes(key));
        }

        return false;
    }

    /**
     * Update model
     * @param set
     * @param options
     * @return {Promise<UpdateResult>}
     */
    update(set: StringToAnyObject, options?: UpdateOptions): Promise<UpdateResult> {
        this.$canTalkToDatabase("UPDATE_ERROR");
        return <Promise<UpdateResult>>this.set(set).save(options);
    }

    /**
     * Update model using raw updateQuery
     *
     * Note: No Validation for raw queries
     * @param update
     * @param options
     */
    updateRaw<DataType = any>(
        update: UpdateFilter<DataType> | Partial<DataType>,
        options?: UpdateOptions
    ): Promise<UpdateResult> {
        this.$canTalkToDatabase("UPDATE_RAW_ERROR");

        return this.$static()
            .native()
            .updateOne(this.$findOneQuery()!, update, options!) as Promise<UpdateResult>;
    }

    /**
     * Create Model if not id is missing or save document if id is found.
     * @param options
     * @param create
     */
    save(
        options: UpdateOptions | InsertOneOptions = {},
        create = false
    ): Promise<boolean | UpdateResult | InsertOneResult<any>> {
        return new Promise(async (resolve, reject) => {
            const findOneQuery = this.$findOneQuery();

            if (findOneQuery && !this.meta.usingCustomId) {
                await RunOnEvent("update", this);

                let $set = {} as StringToAnyObject;
                const changes = this.changes();

                // if no changes then return false
                if (!Object.keys(changes).length) return resolve(false);

                // Try to validate changes
                try {
                    $set = this.validate(changes);

                    // if validated data i.e $set us empty after validation, then return false
                    if (!Object.keys($set).length) return resolve(false);

                    if (this.meta.hasUniqueSchema) {
                        await this.$checkUniqueSchema($set);
                    }

                    // Set original to this.
                    _.merge(this.original, $set);
                } catch (e) {
                    return reject(e);
                }

                this.$static()
                    .native()
                    .updateOne(findOneQuery, { $set }, options, (error, res) => {
                        if (error) {
                            return reject(error);
                        } else {
                            // Resolve
                            resolve(res as UpdateResult);

                            // Run Watch Event
                            RunOnEvent("watch", this, changes);
                        }
                    });
            } else {
                await RunOnEvent("create", this);
                // Try to validate new data.
                try {
                    this.$emptyData(this.validate(undefined));

                    if (this.meta.hasUniqueSchema) {
                        await this.$checkUniqueSchema();
                    }
                } catch (e) {
                    return reject(e);
                }

                return this.$static()
                    .native()
                    .insertOne(this.data, options, (error, res) => {
                        if (error) return reject(error);
                        const { insertedId } = res!;

                        this.set("_id", insertedId);
                        this.$setOriginal(this.data);

                        // resolve
                        resolve(res as InsertOneResult);

                        // Run on created event
                        RunOnEvent("created", this);
                    });
            }
        });
    }

    /**
     * Save and return current
     * @param options
     */
    async saveAndReturn(options: UpdateOptions | InsertOneOptions = {}) {
        await this.save(options);
        return this;
    }

    /**
     * Unset a key or keys from this collection
     * @param {string|[]} keys - Key or Keys to unset from collection
     * @param {Object} options - Update options
     */
    unset(keys: string | string[], options: UpdateOptions = {}): Promise<UpdateResult> {
        this.$canTalkToDatabase("UNSET_ERROR");

        // Throw Error if keys is undefined
        if (!keys) throw Error("Unset key or keys is required.");

        // Throw Error if keys is not a string or array
        if (typeof keys !== "string" && typeof keys !== "object")
            throw Error("Unset key or keys must be typeof (String|Array)");

        // Setup $unset object
        const $unset: StringToAnyObject = {};

        // Change keys to Array if its a string
        if (typeof keys === "string") keys = [keys];

        // Loop Through and add to $unset object
        for (const key of keys) {
            $unset[key] = 1;
        }

        // Run MongoDb query and return response in Promise
        return new Promise((resolve, reject) => {
            return this.$static()
                .native()
                .updateOne(this.$findOneQuery()!, { $unset }, options, (error, res) => {
                    if (error) return reject(error);

                    // Remove keys from current data
                    for (const key of keys) {
                        this.toCollection().unset(key);
                    }

                    return resolve(res as UpdateResult);
                });
        });
    }

    /**
     * Validate
     * @description
     * Runs validation on this.data if data is undefined.
     * @param data
     * @return {{}}
     */
    validate(data?: StringToAnyObject): StringToAnyObject {
        if (!this.meta.hasLoadedSchema) this.$useSchema(undefined, false);

        const isStrict = this.$isStrict();

        /**
         * Checks if data was defined or not.
         * @type {boolean}
         */
        let customData = true;

        /**
         * If data is undefined, default to this.data
         * And set customData to false.
         */
        if (!data) {
            data = this.data;
            customData = false;
        }

        /**
         * Stores validated keys and values.
         * @type {{}}
         */
        const validated: StringToAnyObject = {};

        if (isStrict) {
            // find keys not defined in data
            for (const field in data) {
                // If not defined in schema
                this.$throwErrorIfNotDefinedInSchema(field, isStrict, data);
            }
        }

        /**
         * Loop through all defined schemas and validate.
         */
        for (const schemaKey in this.schema) {
            /**
             * If data doesnt have schemaKey we skip
             * else throw Error if this is not a customData
             *
             * i.e else if data === this.data
             */

            if (data.hasOwnProperty(schemaKey)) {
                /**
                 * Schema Definition of current Model instance
                 * @type {*|XMongoDataType}
                 */
                const schema = this.schema[schemaKey] as SchemaPropertiesType;

                /**
                 * Current value of key being validated.
                 * @type {*}
                 */
                let dataValue = data[schemaKey];

                if (typeof schema.required === "function") {
                    schema.required = schema.required(this);
                }

                /**
                 * If schema is required and dataValue is undefined
                 * Throw required error
                 */
                if (dataValue === undefined && schema.required) {
                    throw new TypeError(`(${schemaKey}) is required.`);
                }

                // validate using validator if value is not undefined
                if (dataValue !== undefined) {
                    /**
                     * Holds type of validator.
                     */
                    let validatorType: any = typeof schema.validator;

                    /**
                     * Holds validator Error for schemaKey
                     * @type {string}
                     */
                    const validatorError = schema.validationError(schemaKey);

                    /**
                     * If schema isJoi then run joi.
                     *
                     * If validatorType is 'function', run validator
                     * Throw error if validator returns false.
                     *
                     * Else if validatorType is 'object'
                     * validate the object received.
                     */
                    if (schema.isJoi) {
                        if (!Joi.isSchema(schema.validator))
                            throw new Error(`Invalid Joi Schema provided for: ${schemaKey}`);

                        /**
                         * Validate using Joi
                         */
                        dataValue = Joi.attempt(dataValue, schema.validator as Joi.Schema);
                    } else if (
                        typeof schema.validator === "function" &&
                        !schema.validator(dataValue)
                    ) {
                        throw new TypeError(validatorError);
                    } else if (typeof schema.validator === "object") {
                        // Get first key of object
                        validatorType = Object.keys(schema.validator)[0];

                        /**
                         * If validatorType === 'or' run `runOrValidation`,
                         * If validatorType === 'and' run `runAndValidation`
                         */
                        if (
                            validatorType === "or" &&
                            !runOrValidation(dataValue, (schema.validator as any)["or"])
                        ) {
                            throw new TypeError(validatorError);
                        } else if (
                            validatorType === "and" &&
                            !runAndValidation(dataValue, (schema.validator as any)["and"])
                        ) {
                            throw new TypeError(validatorError);
                        }
                    }

                    /**
                     * Cast dataValue if schema.cast is defined and a function
                     */
                    if (typeof schema["cast"] === "function") {
                        // noinspection TypeScriptValidateJSTypes
                        dataValue = schema.cast(dataValue, schemaKey);
                    }

                    // Add to validated object
                    validated[schemaKey] = dataValue;
                }
            } else {
                if (!customData) {
                    const schema: SchemaPropertiesType = this.schema[schemaKey];

                    if (schema && typeof schema.required === "function") {
                        schema.required = schema.required(this);
                    }

                    if (schema && schema.required)
                        throw new TypeError(
                            `${schemaKey} is missing in data but required in schema`
                        );
                }
            }
        }

        // Add keys not in schema but in data and removed undefined values
        for (const dataKey in data) {
            const dataValue = data[dataKey];

            if (!this.schema.hasOwnProperty(dataKey) && dataValue !== undefined) {
                validated[dataKey] = dataValue;
            }

            if (dataValue === undefined) {
                delete data[dataKey];
            }
        }

        // Return this way to retain original object structure
        return { ...data, ...validated };
    }

    /**
     * Delete this
     * @returns {Promise}
     */
    async delete(): Promise<DeleteResult> {
        const findOneQuery = this.$findOneQuery();

        if (findOneQuery) {
            // Delete Document
            const result = await this.$static().native().deleteOne(findOneQuery);

            RunOnEvent("deleted", this).finally(() => {});

            return result;
        } else {
            throw "DELETE_ERROR: Model does not have an _id, so we assume it is not from the database.";
        }
    }

    /**
     * Sets data as an instance of ObjectCollection on this.$data
     * @return {ObjectCollection}
     */
    toCollection<DT extends StringToAnyObject>(): ObjectCollection<DT> {
        if (!this.hasOwnProperty("$data")) {
            Object.defineProperty(this, "$data", {
                value: new ObjectCollection(this.data),
                writable: true,
                enumerable: false
            });

            return this.$data as ObjectCollection<DT>;
        }

        return this.$data as ObjectCollection<DT>;
    }

    /**
     * Use data provided to model instance.
     * @param {{}} data
     */
    static use<T extends typeof XMongoModel>(this: T, data: StringToAnyObject): InstanceType<T> {
        const model = new this(false);

        // Replace defaults with new data
        model.$replaceData(data);

        // return model
        return model as InstanceType<T>;
    }

    /**
     * Check if a document exists.
     * Projects only Id and returns boolean.
     */
    static async exists(query: StringToAnyObject | Object) {
        let where = query;
        if (this.isValidId(query)) {
            where = { _id: query };
        }

        /**
         * Project only ID so that mongodb doesn't have to read disk.
         * only relevant if query is ID
         */
        const find = await this.native().findOne(where, { projection: { _id: 1 } });

        return ![null, undefined].includes(find);
    }

    /**
     * Has One relationship
     * @param relationship
     * @param extend
     */
    async hasOne(
        relationship: string,
        extend: {
            as?: boolean | string;
            options?: Record<string, any>;
            cast?: boolean;
        } = {}
    ): Promise<any | XMongoModel> {
        let relationships = this.$static().relationships;

        if (
            relationships &&
            typeof relationships === "object" &&
            relationships.hasOwnProperty(relationship)
        ) {
            const config = relationships[relationship];
            if (config.type !== "hasOne") {
                throw Error(`Relationship: (${relationship}) is not of type "hasOne"`);
            }

            /**
             * Raw option check.
             * @type {boolean|boolean}
             */
            const cast = extend.hasOwnProperty("cast") && extend.cast === true;

            /**
             * Get query option
             * @type {*|{}}
             */
            let options = _.cloneDeep(config.options || {});
            if (extend.hasOwnProperty("options")) options = _.cloneDeep(extend.options) as any;

            /**
             * Get Relationship where query.
             * @type {*}
             */
            let where: StringToAnyObject = _.clone(config.where);
            if (typeof where === "object" && Object.keys(where).length) {
                /**
                 * Loop through all keys in where query and change the values
                 * to matching model instance values.
                 */
                for (const key in where) {
                    where[key] = this.get(where[key]);
                }
            } else {
                where = {};
            }

            if (typeof extend !== "object") {
                throw Error(`hasOne second argument must be of type "Object"`);
            }

            /**
             * Get hasOne Model.
             */
            let model = config.model;

            if (Array.isArray(model) && typeof model[0] === "function") model = model[0]();

            let relatedData = await(<typeof XMongoModel>model)
                .native()
                .findOne(where, options) as any;

            if (cast && relatedData) relatedData = (<typeof XMongoModel>model).use(relatedData);

            /**
             * Set relationship to value provided in the extend.as config.
             */
            if (typeof extend["as"] === "string") relationship = extend["as"];

            // Don't extend if extend === false
            if (extend["as"] !== false) {
                this.set(relationship, relatedData);
                this.loadedRelationships.push(relationship);
            }

            return <StringToAnyObject | typeof XMongoModel>relatedData;
        } else {
            throw Error(
                `Relationship: (${relationship}) does not exists in model {${this.constructor.name}}`
            );
        }
    }

    /**
     * toJSON converter.
     * @private
     * @return {*}
     */
    toJSON(): StringToAnyObject {
        return this.data;
    }

    /**
     * Converts this.data to json using JSON.stringify()
     * @param replacer
     * @param space
     */
    toJson(replacer = undefined, space = undefined): string {
        return JSON.stringify(this.data, replacer, space);
    }

    /**
     * Alias to mongo.ObjectId
     * if no string is passed it returns a new id.
     * @param str {*}
     * @return {*}
     */
    static id(str?: any): ObjectId {
        let _id: ObjectId | string = str ? str : new ObjectId();

        if (typeof str === "string") {
            try {
                _id = new ObjectId(str);
            } catch (e) {
                throw new Error(`Model.id() Error: ${str} is not a valid ObjectId`);
            }
        }

        return _id as ObjectId;
    }

    /**
     * Find many in collection
     * @param query
     * @param options
     */
    static find<Return = any>(
        query: StringToAnyObject | Filter<any> = {},
        options: FindOptions<any> = {}
    ): Promise<Return[]> {
        return new Promise((resolve, reject) => {
            return this.native()
                .find(query, options)
                .toArray((error, data) => {
                    if (error) return reject(error);
                    return resolve(data as any);
                });
        });
    }

    static findRaw(
        query: StringToAnyObject | Filter<any> = {},
        options: FindOptions<any> = {}
    ): FindCursor {
        /**
         * options as any is used here because mongodb did not make its new
         * WithoutProjection type exportable so we can't make reference to it.
         */
        return this.native().find(query, options as any);
    }

    /**
     * Fetches the first document that matches the query
     * @param query
     * @param options
     * @param raw
     */
    static findOne<T extends typeof XMongoModel>(
        this: T,
        query: StringToAnyObject | Filter<any> = {},
        options: FindOptions<any> | boolean = {},
        raw = false
    ): Promise<InstanceType<T> | null> {
        if (typeof options === "boolean") {
            raw = options;
            options = {};
        }

        return new Promise((resolve, reject) => {
            /**
             * options as any is used here because mongodb did not make its new
             * WithoutProjection type exportable so we can't make reference to it.
             */
            return this.native().findOne(query, options as any, (error, data) => {
                if (error) return reject(error);
                // Return new instance of Model
                if (!data) return resolve(null);
                if (raw) return resolve(data as any);

                return resolve(this.use(data).$updateFindOneQuery(query) as InstanceType<T>);
            });
        });
    }

    /**
     * Fetches the first document that matches id provided.
     * @param _id
     * @param options
     * @param isTypeObjectId
     * @return {Promise<XMongoModel>}
     */
    static findById<T extends typeof XMongoModel>(
        this: T,
        _id: any,
        options: FindOptions<any> = {},
        isTypeObjectId = true
    ): Promise<InstanceType<T> | null> {
        let where;
        if (typeof _id === "string" || !isTypeObjectId) {
            where = { _id: this.id(_id) };
        } else {
            where = { _id };
        }

        return this.findOne(<StringToAnyObject>where, options);
    }

    /**
     * Count All the documents that match query.
     * @param query
     * @param options
     * @return {void | * | Promise | undefined | IDBRequest<number>}
     */
    static count(
        query: StringToAnyObject | Filter<any> = {},
        options?: FindOptions<any>
    ): Promise<number> {
        /**
         * options as any is used here because mongodb did not make its new
         * WithoutProjection type exportable so we can't make reference to it.
         */
        return this.native()
            .find(query, options as any)
            .count();
    }

    /**
     * Sum fields in this collection.
     * @example
     * data: [
     *  {name: 'john', credit: 100, debit: 400},
     *  {name: 'doe', credit: 200, debit: 300}
     * ]
     *
     * const sumOfCredit = await Model.sum('credit');
     * ==> 300
     *
     * const sumOfBoth = await Model.sum(['credit', 'debit']);
     * ==> {credit: 300, debit: 700}
     *
     * @param fields
     * @param match
     */
    static async sum(
        fields: string | StringToAnyObject | string[],
        match?: StringToAnyObject
    ): Promise<number | { [name: string]: number }> {
        const $group: StringToAnyObject = { _id: null };
        const $result: StringToAnyObject = {};

        if (typeof fields === "string") fields = [fields];

        const fieldIsArray = Array.isArray(fields);
        if (fieldIsArray) {
            for (const field of fields as string[]) {
                $group[field] = { $sum: "$" + field };
                $result[field] = 0;
            }
        } else if (typeof fields === "object") {
            const keys = Object.keys(fields);
            for (const field of keys as string[]) {
                $group[field] = { $sum: "$" + (<any>fields)[field] };
                $result[field] = 0;
            }
            fields = keys;
        }

        let result = await this.native()
            .aggregate([{ $match: match }, { $group }])
            .toArray();

        if (result.length) {
            for (const field of fields as string[]) {
                $result[field] = result[0][field as any] || 0;
            }
        }

        return fields.length === 1 ? $result[(<string[]>fields)[0]] : $result;
    }

    /**
     * Count Aggregations
     * @param query
     * @param options
     */
    static async countAggregate(query: any[] = [], options?: AggregateOptions): Promise<number> {
        query = _.cloneDeep(query);
        query.push({ $count: "count_aggregate" });

        const data = await this.native().aggregate(query, options).toArray();

        if (data.length) {
            return data[0]["count_aggregate"];
        }
        return 0;
    }

    /**
     * Paginate Find.
     * @param query
     * @param options
     * @param page
     * @param perPage
     */
    static async paginate<T = any>(
        page: number = 1,
        perPage: number = 20,
        query = {},
        options: FindOptions<any> = {}
    ): Promise<PaginationData<T>> {
        page = Number(page);
        perPage = Number(perPage);

        const total = await this.count(query);
        const lastPage = Math.ceil(total / perPage);
        const skips = perPage * (page - 1);

        /**
         * options as any is used here because mongodb did not make its new
         * WithoutProjection<FindOptions<TsSchema>> type exportable, so we can't make reference to it.
         */
        const data = await this.native()
            .find(query, options as any)
            .skip(skips)
            .limit(perPage)
            .toArray();

        return {
            total,
            perPage,
            page,
            lastPage,
            data
        };
    }

    /**
     * Paginate Aggregation.
     * @param {number} page
     * @param {number} perPage
     * @param {[]} query
     * @param {*} options
     * @returns {Promise<{total: (*|number), perPage: number, lastPage: number, data: *, page: number}>}
     */
    static async paginateAggregate<T = any>(
        page = 1,
        perPage = 20,
        query: any[] = [],
        options: AggregateOptions = {}
    ): Promise<PaginationData<T>> {
        query = _.cloneDeep(query);

        page = Number(page);
        perPage = Number(perPage);

        const total = await this.countAggregate(query);
        const lastPage = Math.ceil(total / perPage);
        const skips = perPage * (page - 1);

        query.push({ $skip: skips });
        query.push({ $limit: perPage });

        const data = (await this.native().aggregate(query, options).toArray()) as T[];

        return {
            total,
            perPage,
            page,
            lastPage,
            data
        };
    }

    /**
     * Turn array provided to model instances.
     *
     * @example
     * E.G
     *      contact = ContactModel.fromArray([...SomeAlreadyFetchedData])
     *
     *
     * @static
     * @method
     * @param data
     * @param mutate
     *
     * @return {Promise<this[]>|this[]} returns - Array of model instances
     */
    static fromArray<T extends typeof XMongoModel>(
        this: T,
        data: any[],
        mutate = false
    ): InstanceType<T>[] {
        if (mutate) {
            for (const index in data) {
                data[index] = this.use<T>(data[index]);
            }
            return data;
        } else {
            return data.map((i) => this.use<T>(i));
        }
    }

    /**
     * Turn query result array provided to model instances.

     * @example
     * E.G
     *      contact = ContactModel.fromArray(native => native.find().limit(10));
     *
     * WHICH IS ===
     *
     *      Model.native().find().limit(10).toArray((err, lists) => {
     *          Model.fromArray(lists);
     *      })
     *
     *
     * @static
     * @method
     * @param {Object[]} query - Data as array or query as function.
     * @param {function|boolean} interceptor - Intercepts raw database array if not false.
     */
    static fromQuery<T extends typeof XMongoModel>(
        this: T,
        query: FunctionWithRawArgument,
        interceptor: false | { (lists: Array<any>): any } = false
    ): Promise<InstanceType<T>[]> {
        return new Promise((resolve, reject) => {
            return query(this.native()).toArray((error, lists) => {
                if (error) return reject(error);

                /**
                 * Check if interceptor is a function
                 * if it is we pass list to the function
                 *
                 * else we pass it to self (fromArray)
                 */
                return resolve(
                    typeof interceptor === "function"
                        ? interceptor(lists as any[])
                        : this.fromArray(lists as any[])
                );
            });
        });
    }

    /**
     * A helper to fetch result as array.
     * @param query - a function
     * @returns {Promise<[]>}
     */
    static toArray(query: FunctionWithRawArgument): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (typeof query !== "function")
                return reject(Error(".toArray expects a function as argument"));

            query(this.native()).toArray((error, data) => {
                if (error) return reject(error);
                return resolve(data as any[]);
            });
        });
    }

    /**
     * Register Events for create, update and delete
     * @param event
     * @param functionOrFunctions
     */
    static on<T extends typeof XMongoModel>(
        this: T,
        event:
            | "create"
            | "update"
            | "deleted"
            | "create.fieldName"
            | "update.fieldName"
            | "watch.fieldName"
            | string,
        functionOrFunctions:
            | ((modelInstance: InstanceType<T>) => void | any)
            | Record<string, (modelInstance: InstanceType<T>) => void | any>
    ) {
        // Get Current Model Name
        const modelName = this.name || "Model";

        // Throw error if deprecated `delete` command is used.
        if (event === "delete")
            throw Error(`${modelName}.on("${event}") is deprecated. Use "deleted" instead.`);

        const handlerIsFunction = typeof functionOrFunctions === "function";
        // Validate events that must be a function
        if (["deleted", "created"].includes(event) && !handlerIsFunction) {
            throw Error(`${modelName}.on("${event}") event must be type of Function.`);
        }

        const handlerIsObject = typeof functionOrFunctions === "object";
        // watch when not using dot notation must be an object
        if (event === "watch" && !handlerIsObject) {
            throw Error(`${modelName}.on("watch") event must be type of Object.`);
        }

        /**
         * Parse Dot Notation "event.field"
         */
        if (event.includes(".")) {
            if (!handlerIsFunction) {
                throw Error(
                    `Event handler for DOT notated events must be a function.  {event:"${event}"}`
                );
            }
            // Split .
            const dots: string[] = event.split(".");

            // Throw error if more than dots
            if (dots.length > 2) {
                throw Error(
                    `Model events supports only first level Field names when using DOT notation. {event:"${event}"}`
                );
            } else if (dots.length === 2) {
                // Check if event supports the dot notation
                let [main] = dots;

                if (!["create", "update", "watch"].includes(main)) {
                    throw Error(
                        `${modelName}.on("${main}") does not support DOT notation. {event:"${event}"}`
                    );
                }
            }
        }

        // Set to default if not.
        if (!this.events) this.events = {};

        // Merge to events
        if (handlerIsObject) {
            _.merge(this.events, _.extend({}, { [event]: functionOrFunctions }));
        } else {
            _.merge(this.events, _.set({}, event, functionOrFunctions));
        }
    }

    /**
     * Replace Current Model Instance Data
     * @param data
     * @param append
     */
    $replaceData(data: any, append?: string[]): this {
        // First Empty Data
        this.$emptyData();
        // Set Original Property
        this.$setOriginal(data);
        // Set Normal Data
        this.set(data);

        // Get Append
        if (!append) append = this.$static().append;

        // If append then run append functions
        if (append) {
            for (const key of append) {
                if (typeof (this as StringToAnyObject)[key] === "function") {
                    this.set(key, (this as StringToAnyObject)[key]());
                }
            }
        }

        return this;
    }

    /**
     * Refresh Current Model Data using model id
     * @param options
     */
    async $refreshData(options?: FindOptions<any>) {
        const findOneQuery = this.$findOneQuery();

        if (!findOneQuery)
            throw Error("Error refreshing data, _id/findOneQuery not found in current model.");

        const Model = this.$static();
        const value = await Model.findOne(findOneQuery, options);

        if (!value) throw Error("Error refreshing data, Refresh result is null");

        this.$replaceData(value.data);
        if (this.meta.usingCustomId) this.meta.usingCustomId = false;

        return this;
    }

    /**
     * Refresh Current Model Data using the specified fields value.
     * @param field
     * @param options
     */
    async $refreshDataUsing(field: string, options?: FindOptions<any>) {
        const fieldValue = this.get(field);
        if (!fieldValue) throw Error(`Error refreshing data, ${field} not found in current model.`);

        const Model = this.$static();
        const value = await Model.findOne({ [field]: this.get(field) }, options);

        if (!value) throw Error("Error refreshing data, Refresh result is null");

        this.$replaceData(value.data);

        return this;
    }

    /**
     * Get Static Class from Instance
     */
    $static<S extends typeof XMongoModel>() {
        return this.constructor as S;
    }

    /**
     * Check if strict is set to true.
     */
    protected $isStrict() {
        const isStrict = this.$static().strict;
        return isStrict === true || typeof isStrict === "object" ? isStrict : false;
    }

    /**
     * Throw Error is a field is not defined in Schema
     * @param field
     * @param isStrict
     * @param workingData
     * @private
     */
    private $throwErrorIfNotDefinedInSchema(
        field: string,
        isStrict?: XMongoStrictConfig,
        workingData?: Record<string, any>
    ) {
        if (isStrict === undefined) isStrict = this.$isStrict();

        if (
            // if is strict
            isStrict &&
            // not defined in schema
            !this.schema.hasOwnProperty(field) &&
            // and not '_id'
            field !== "_id" &&
            // And does not include a dot notation
            field.indexOf(".") < 0
        ) {
            if (typeof isStrict === "object" && isStrict.removeNonSchemaFields) {
                delete this.data[field];
                if (workingData) delete workingData[field];
            } else {
                throw new Error(`STRICT: "${field}" is not defined in schema.`);
            }
        }
    }

    /**
     * Define Schema
     * @protected
     */
    protected $definedSchema() {
        return this.$static().schema || {};
    }

    /**
     * Validates unique schemas
     * @param data
     * @private
     */
    private $checkUniqueSchema(data?: StringToAnyObject): Promise<boolean | Error> {
        return new Promise(async (resolve, reject) => {
            if (!this.meta.hasUniqueSchema) return resolve(true);
            if (!data) data = this.data;

            for (const field of this.meta.hasUniqueSchema) {
                if (!data[field]) continue;

                const schema: SchemaPropertiesType = this.schema[field];
                if (!schema) continue;

                try {
                    const uniqueQuery = schema.uniqueQuery || {};

                    let findQuery: any = uniqueQuery.query;
                    if (!findQuery) findQuery = { [field]: data[field] };

                    if (typeof findQuery === "function") {
                        findQuery = findQuery(this);
                    }

                    const findField = await this.$static()
                        .native()
                        .findOne(findQuery as Filter<any>);

                    if (findField)
                        return reject(Error(`Field: (${field}) expects a unique value!`));
                } catch (e) {
                    return reject(e);
                }
            }

            return resolve(true);
        });
    }

    public $updateFindOneQuery(query: string | string[] | Record<string, any>) {
        // if string, set to object with value of field
        if (typeof query === "string") {
            this.meta.findQuery = { [query]: this.get(query) };
        }
        // if array, populate object with fields and value.
        else if (Array.isArray(query)) {
            this.meta.findQuery = _.pick(this.data, query);
        }
        // if object, populate object with fields and value.
        else if (typeof query === "object") {
            this.meta.findQuery = query;
        }
        // Else throw error
        else {
            throw new Error("Invalid query type");
        }
        return this;
    }

    /**
     * Get the find query
     * @private
     */
    private $findOneQuery() {
        const _id = this.id();
        if (_id) {
            return { _id };
        } else if (this.meta.findQuery) {
            return this.meta.findQuery;
        } else {
            return undefined;
        }
    }

    private $canTalkToDatabase(name: string) {
        if (this.meta.usingCustomId || !this.$findOneQuery())
            throw Error(
                `${name}: Model does not have an _id, so we assume it is not from the database.`
            );

        return this;
    }
}

export = XMongoModel;
