import ObjectCollection = require('object-collection');
import XMongoDataType = require('./XMongoDataType');

import {
    ObjectID,
    Collection,
    UpdateWriteOpResult,
    InsertOneWriteOpResult,
    DeleteWriteOpResultObject,
    Cursor,
    FindOneOptions,
    UpdateOneOptions,
    CollectionInsertOneOptions,
    CollectionAggregationOptions, AggregationCursor, UpdateQuery, FilterQuery
} from 'mongodb';

import is from './SchemaBuilder';
import {diff} from 'deep-object-diff';
import {defaultValue, runOrValidation, runAndValidation, RunOnEvent} from '../fn/inbuilt';
import {PaginationData, SchemaPropertiesType, StringToAnyObject, XMongoSchemaBuilder} from "./CustomTypes";

/**
 * Get Lodash
 */
const _ = ObjectCollection.getLodash();

type FunctionWithRawArgument = { (raw: Collection): Cursor | AggregationCursor };

// type ModelRelationships  = {;
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
    public static schema: StringToAnyObject = {};

    /**
     * Model Events
     */
    public static events: StringToAnyObject = {};

    /**
     * Model Schema Store
     * @private
     * @type {{}}
     */
    public schemaStore: StringToAnyObject = {};

    /**
     * Defined relationships
     * @type {{}}
     */
    static relationships: {
        [relationship: string]: {
            type: string,
            model: typeof XMongoModel | [() => typeof XMongoModel],
            where: Record<string, any>
            options?: Record<string, any>,
        }
    } = {};

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
    constructor() {
        // Assume data is empty
        this.emptyData();

        Object.defineProperty(this, 'schema', {
            value: {},
            writable: true,
            enumerable: false,
            configurable: true,
        });

        Object.defineProperty(this, 'original', {
            value: {},
            writable: true,
            enumerable: false
        });

        Object.defineProperty(this, 'schemaStore', {
            value: {},
            writable: true,
            enumerable: false
        });

        Object.defineProperty(this, 'loadedRelationships', {
            value: [],
            writable: true,
            enumerable: false
        })


        /**
         * Set Model Schema if exists
         */
        const thisClass = (this.constructor as typeof XMongoModel);
        if (thisClass.schema) {
            this.useSchema(thisClass.schema);
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
    };

    /**
     * Returns native mongodb instance to run native queries
     */
    static native(): Collection {
        // @ts-ignore
        return null;
    };

    /**
     * Empties data in current model.
     * @param replaceWith
     * @returns {this}
     */
    emptyData(replaceWith?: StringToAnyObject): this {
        const _id = this.id();

        /**
         * if _id exists then add it.
         */
        if (_id) {
            this.data = {_id};
        } else {
            this.data = {};
        }


        if (replaceWith && typeof replaceWith === 'object') this.data = {...this.data, ...replaceWith};

        return this;
    };


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
    set(key: string | StringToAnyObject, value?: any): this {
        if (typeof key === 'object' && value === undefined) {
            for (const property in key) {
                _.set(this.data, property, key[property])
            }
        } else if (typeof key === 'string') {
            _.set(this.data, key, value)
        }
        return this;
    }

    /**
     * Check if field exists in data
     * @param key
     */
    has(key: string): boolean {
        return _.has(this.data, key)
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
    static async new<T extends typeof XMongoModel>(this: T, data: StringToAnyObject, save = true): Promise<InstanceType<T>> {
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
        return (new this()).set(data) as InstanceType<T>;
    }

    /**
     * Check if id is a valid id
     * @param id
     * @return {boolean}
     */
    static isValidId(id: any): boolean {
        const isMongoID = ObjectID.isValid(id);

        /**
         * referring to this StackOverflow post
         * https://stackoverflow.com/questions/13850819/can-i-determine-if-a-string-is-a-mongodb-objectid
         *
         * ObjectID.isValid returns true on any 12 length string
         *
         * So converting to objectID and checking if the string value matches the original value
         * makes the check strict
         */
        if (isMongoID && typeof id === 'string') {
            return (new ObjectID(id)).toString() === id;
        }

        return isMongoID;
    }


    /**
     * Set Original result gotten from db
     * @param data
     * @return {this}
     */
    setOriginal(data: StringToAnyObject): this {

        data = _.cloneDeep(data);

        Object.defineProperty(this, 'original', {
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
    addSchema(name: string, schema: StringToAnyObject): this {
        // Save to schemaStore
        this.schemaStore[name] = schema;
        return this;
    }

    /**
     * Set Model Schema
     * @param {Object|string} schema
     * @returns {this}
     *
     * @deprecated
     * since (v 0.0.42)
     * @remove at (v 1.0.0)
     */
    setSchema(schema: any): this {
        console.log(`.setSchema is deprecated use .useSchema`);
        return this.useSchema(schema);
    }

    /**
     * Set Model Schema
     *
     * if `schema` is undefined then `this.data` is used as schema object
     * @param {Object|String} schema
     * @returns {this}
     */
    useSchema(schema: string | StringToAnyObject | { (is: XMongoSchemaBuilder): StringToAnyObject }): this {

        // Try to find schema from .schemaStore if string
        if (typeof schema === "string") {
            if (!this.schemaStore.hasOwnProperty(schema)) {
                throw Error(`schemaStore does not have schema named: ${schema}`)
            }

            // Empty Data to remove any predefined schemas
            if (!Object.keys(this.original).length) {
                this.emptyData();
            }
            schema = this.schemaStore[schema] || {}
        }

        const newData: StringToAnyObject = {_id: this.id()};

        // If schema is a function then call it and pass is.
        if (typeof schema === "function") {
            schema = schema(is);
        }


        if (typeof schema === 'object') {
            for (const key in schema) {
                if (schema.hasOwnProperty(key)) {
                    let schemaVal: XMongoDataType = schema[key];
                    this.schema[key] = schemaVal['schema'];

                    // Attach default values
                    const value = defaultValue(this.schema[key]);

                    /**
                     * If default value is undefined and schema is required set key to undefined.
                     * else set key to value.
                     *
                     * This removes not required keys with undefined values.
                     */
                    if (value === undefined) {
                        if (schemaVal.schema.required) {
                            newData[key] = value
                        }
                    } else {
                        newData[key] = value
                    }
                }
            }
        }


        /**
         * Fill up keys defined in data but not in schema
         */
        for (const key in this.data) {
            // noinspection JSUnfilteredForInLoop
            if (!newData.hasOwnProperty(key)) {
                // noinspection JSUnfilteredForInLoop
                newData[key] = this.data[key]
            }
        }

        this.data = newData;

        return this;
    }

    /**
     * Get id of current model instance
     * @returns {*|ObjectID|null}
     */
    id(): any | ObjectID | null {
        return (this.data && this.data['_id']) || null
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
         * @type {ObjectID|string}
         */
        let compareWith = this.get(key, undefined);

        // Return false of to || compareWith is false, undefined or null
        if (!to || !compareWith) return false;

        /**
         * If to || compareWith is typeof objectID, we run toString() get the string value.
         */
        if (ObjectID.isValid(to)) to = to.toString();
        if (ObjectID.isValid(compareWith)) compareWith = compareWith.toString();

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
                data[key] = this.data[key]
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
     * Update model
     * @param set
     * @param options
     * @return {Promise<UpdateWriteOpResult>}
     */
    update(set: StringToAnyObject, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {
        if (!this.id()) throw Error("UPDATE_ERROR: Model does not have an _id, so we assume it is not from the database.");
        return <Promise<UpdateWriteOpResult>>this.set(set).save(options)
    }

    /**
     * Update model using raw updateQuery
     * @param update
     * @param options
     * @return {Promise<UpdateWriteOpResult>}
     */
    updateRaw(update: UpdateQuery<any> | Partial<any>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {
        if (!this.id()) throw Error("UPDATE_RAW_ERROR: Model does not have an _id, so we assume it is not from the database.");
        return new Promise((resolve, reject) => {
            return (<typeof XMongoModel>this.constructor).native().updateOne(
                {_id: this.id()},
                update,
                <UpdateOneOptions>options,
                (error, res) => error ? reject(error) : resolve(res.connection))
        });
    }

    /**
     * Create Model if not id is missing or save document if id is found.
     * @param options
     * @param create
     * @return {Promise<UpdateWriteOpResult | InsertOneWriteOpResult<*>>}
     */
    save(options: UpdateOneOptions | CollectionInsertOneOptions = {}, create = false): Promise<boolean | UpdateWriteOpResult | InsertOneWriteOpResult<any>> {
        return new Promise(async (resolve, reject) => {
            const id = this.id();

            if (id) {
                await RunOnEvent('update', this);

                let $set, changes = this.changes();
                let $setKeys = Object.keys(changes);
                if (!$setKeys.length) return resolve(false);

                // Try to validate changes
                try {
                    $set = {...changes, ...this.validate(changes)};
                } catch (e) {
                    return reject(e)
                }

                return (<typeof XMongoModel>this.constructor).native().updateOne(
                    {_id: this.id()},
                    {$set},
                    <UpdateOneOptions>options,
                    (error, res) => {
                        if (error) {
                            return reject(error)
                        } else {
                            resolve(res.connection)
                            RunOnEvent('watch', this, changes);
                        }
                    })
            } else {
                await RunOnEvent('create', this);
                // Try to validate new data.
                try {
                    this.emptyData(this.validate());
                } catch (e) {
                    return reject(e)
                }

                return (<typeof XMongoModel>this.constructor).native().insertOne(
                    this.data,
                    <CollectionInsertOneOptions>options,
                    (error, res) => {
                        if (error) return reject(error);
                        const {insertedId} = res;

                        this.set('_id', insertedId);
                        this.setOriginal(this.data);

                        return resolve(res)
                    })
            }
        });
    }

    /**
     * Unset a key or keys from this collection
     * @param {string|[]} keys - Key or Keys to unset from collection
     * @param {Object} options - Update options
     */
    unset(keys: string | string[], options: UpdateOneOptions = {}): Promise<UpdateWriteOpResult> {

        // Throw Error if keys is undefined
        if (!keys)
            throw Error('Unset key or keys is required.');

        // Throw Error if keys is not a string or array
        if (typeof keys !== "string" && typeof keys !== "object")
            throw Error('Unset key or keys must be typeof (String|Array)');

        // Setup $unset object
        const $unset: StringToAnyObject = {};

        // Change keys to Array if its a string
        if (typeof keys === "string") keys = [keys];

        // Loop Through and add to $unset object
        for (const key of keys) {
            $unset[key] = 1
        }

        // Run MongoDb query and return response in Promise
        return new Promise((resolve, reject) => {
            return (<typeof XMongoModel>this.constructor).native().updateOne(
                {_id: this.id()},
                {$unset},
                options,
                (error, res) => {
                    if (error) return reject(error);

                    // Remove keys from current data
                    for (const key of keys) {
                        this.toCollection().unset(key);
                    }

                    return resolve(res)
                }
            )
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
                 * Schema Definition of current schema
                 * @type {*|XMongoDataType}
                 */
                const schema = this.schema[schemaKey];

                /**
                 * Current value of key being validated.
                 * @type {*}
                 */
                let dataValue = data[schemaKey];

                /**
                 * If schema is required and dataValue is undefined
                 * Throw required error
                 */
                if (dataValue === undefined && schema['required'] === true) {
                    throw new TypeError(`(${schemaKey}) is required.`)
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
                     * If validatorType is 'function', run validator
                     * Throw error if validator returns false.
                     *
                     * Else if validatorType is 'object'
                     * validate the object received.
                     */
                    if (validatorType === 'function' && !schema.validator(dataValue)) {
                        throw new TypeError(validatorError);
                    } else if (validatorType === 'object') {
                        // Get first key of object
                        validatorType = Object.keys(schema.validator)[0];

                        /**
                         * If validatorType === 'or' run `runOrValidation`,
                         * If validatorType === 'and' run `runAndValidation`
                         */
                        if (validatorType === 'or' && !runOrValidation(dataValue, schema.validator['or'])) {
                            throw new TypeError(validatorError);
                        } else if (validatorType === 'and' && !runAndValidation(dataValue, schema.validator['and'])) {
                            throw new TypeError(validatorError);
                        }
                    }


                    /**
                     * Cast dataValue if schema.cast is defined and a function
                     */
                    if (typeof schema['cast'] === 'function') {
                        // noinspection TypeScriptValidateJSTypes
                        dataValue = schema.cast(dataValue, schemaKey);
                    }

                    // Add to validated object
                    validated[schemaKey] = dataValue;
                }
            } else {
                if (!customData) {
                    const schema: SchemaPropertiesType = this.schema[schemaKey];

                    if (schema && schema.required)
                        throw new TypeError(`${schemaKey} is missing in data but defined in schema`)
                }
            }
        }

        // Add keys not in schema but in data and removed undefined values
        for (const dataKey in data) {
            const dataValue = data[dataKey];

            if (!this.schema.hasOwnProperty(dataKey) && dataValue !== undefined) {
                validated[dataKey] = dataValue
            }

            if (dataValue === undefined) {
                delete data[dataKey];
            }
        }

        // Return this way to retain original object structure
        return {...data, ...validated};
    }

    /**
     * Delete this
     * @returns {Promise}
     */
    delete(): Promise<DeleteWriteOpResultObject> {
        const _id = this.id();

        if (_id) {
            // Run on delete Events on background
            RunOnEvent("delete", this).catch(console.error);

            // Delete Document
            return (<typeof XMongoModel>this.constructor).native().deleteOne({_id})
        } else {
            throw "DELETE_ERROR: Model does not have an _id, so we assume it is not from the database.";
        }
    }

    /**
     * Sets data as an instance of ObjectCollection on this.$data
     * @return {ObjectCollection}
     */
    toCollection(): ObjectCollection {
        if (!this.hasOwnProperty('$data')) {
            Object.defineProperty(this, '$data', {
                value: new ObjectCollection(this.data),
                writable: true,
                enumerable: false
            });

            return <ObjectCollection>this.$data;
        }

        return <ObjectCollection>this.$data;
    }

    /**
     * Use data provided to model instance.
     * @param {{}} data
     */
    static use<T extends typeof XMongoModel>(this: T, data: StringToAnyObject): InstanceType<T> {
        const model = new this();
        model.emptyData();
        // Set Original Property
        model.setOriginal(data);
        model.set(data);

        if (this.append) {
            for (const key of this.append) {
                if (typeof (model as StringToAnyObject)[key] === "function") {
                    model.set(key, (model as StringToAnyObject)[key]())
                }
            }
        }

        return model as InstanceType<T>;
    }

    /**
     * Has One relationship
     * @param relationship
     * @param extend
     */
    async hasOne(relationship: string, extend: { as?: boolean | string, options?: Record<string, any>, cast?: boolean } = {}): Promise<any | XMongoModel> {
        let relationships = (<typeof XMongoModel>this.constructor).relationships;

        if (relationships && typeof relationships === "object" && relationships.hasOwnProperty(relationship)) {
            const config = relationships[relationship];
            if (config.type !== "hasOne") {
                throw Error(`Relationship: (${relationship}) is not of type "hasOne"`)
            }

            /**
             * Raw option check.
             * @type {boolean|boolean}
             */
            const cast = extend.hasOwnProperty('cast') && extend.cast === true;

            /**
             * Get query option
             * @type {*|{}}
             */
            let options = _.cloneDeep(config.options || {});
            if (extend.hasOwnProperty('options')) options = _.cloneDeep(extend.options) as any;


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
                    where[key] = this.get(where[key])
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

            if (Array.isArray(model) && typeof model[0] === "function")
                model = model[0]();

            let relatedData = await (<typeof XMongoModel>model).native().findOne(where, options);

            if (cast && relatedData) relatedData = (<typeof XMongoModel>model).use(relatedData);

            /**
             * Set relationship to value provided in the extend.as config.
             */
            if (typeof extend['as'] === "string") relationship = extend['as'];

            // Don't extend if extend === false
            if (extend['as'] !== false) {
                this.set(relationship, relatedData);
                this.loadedRelationships.push(relationship);
            }

            return <StringToAnyObject | typeof XMongoModel>relatedData;
        } else {
            throw Error(`Relationship: (${relationship}) does not exists in model {${this.constructor.name}}`)
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
     * Alias to mongo.ObjectID
     * @param str {*}
     * @param returnObject
     * @return {*}
     */
    static id(str: any, returnObject = false): (ObjectID | string) | { _id: ObjectID | string } {
        let _id: ObjectID | string = str;

        if (typeof str === "string") {
            try {
                _id = new ObjectID(str);
            } catch (e) {
                _id = str;
            }
        }

        if (returnObject) {
            return {_id}
        } else {
            return _id
        }
    }

    /**
     * Find many in collection
     * @param query
     * @param options
     * @param raw
     * @return {Promise<XMongoModel[]>}
     */
    static find(query: (StringToAnyObject | FilterQuery<any>) = {}, options: FindOneOptions<any> = {}, raw = false): Promise<XMongoModel[]> | Cursor {

        /**
         * options as any is used here because mongodb did not make its new
         * WithoutProjection type exportable so we can't make reference to it.
         */
        const result = this.native().find(query, options as any);
        if (raw) return result;

        return new Promise((resolve, reject) => {
            return result.toArray((error, data) => {
                if (error) return reject(error);
                return resolve(data);
            });
        });
    }

    /**
     * Fetches the first document that matches the query
     * @param query
     * @param options
     * @param raw
     */
    static findOne<T extends typeof XMongoModel>(this: T, query: (StringToAnyObject | FilterQuery<any>) = {}, options: FindOneOptions<any> | boolean = {}, raw = false): Promise<InstanceType<T> | null> {

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
                if (raw) return resolve(data);

                return resolve(this.use(data) as InstanceType<T>);
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
    static findById<T extends typeof XMongoModel>(this: T, _id: any, options: FindOneOptions<any> = {}, isTypeObjectId = true): Promise<InstanceType<T> | null> {
        let where;
        if (typeof _id === "string" || !isTypeObjectId) {
            where = XMongoModel.id(_id, true);
        } else {
            where = {_id}
        }

        return this.findOne(<StringToAnyObject>where, options);
    }


    /**
     * Count All the documents that match query.
     * @param query
     * @param options
     * @return {void | * | Promise | undefined | IDBRequest<number>}
     */
    static count(query: (StringToAnyObject | FilterQuery<any>) = {}, options?: FindOneOptions<any>): Promise<number> {
        /**
         * options as any is used here because mongodb did not make its new
         * WithoutProjection type exportable so we can't make reference to it.
         */
        return this.native().find(query, options as any).count()
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
    static async sum(fields: string | StringToAnyObject | string[], match?: StringToAnyObject): Promise<number | { [name: string]: number }> {
        const $group: StringToAnyObject = {_id: null};
        const $result: StringToAnyObject = {};

        if (typeof fields === 'string') fields = [fields];

        const fieldIsArray = Array.isArray(fields);
        if (fieldIsArray) {
            for (const field of fields as string[]) {
                $group[field] = {$sum: '$' + field};
                $result[field] = 0;
            }
        } else if (typeof fields === "object") {
            const keys = Object.keys(fields);
            for (const field of keys as string[]) {
                $group[field] = {$sum: '$' + (<any>fields)[field]};
                $result[field] = 0;
            }
            fields = keys;
        }

        let result = await this.native().aggregate([
            {$match: match},
            {$group}
        ]).toArray();

        if (result.length) {
            result = result[0];

            for (const field of fields as string[]) {
                $result[field] = result[field as any] || 0;
            }
        }

        return fields.length === 1 ? $result[(<string[]>fields)[0]] : $result;
    }

    /**
     * Count Aggregations
     * @param query
     * @param options
     * @returns {Promise<number|*>}
     */
    static async countAggregate(query: any[] = [], options?: CollectionAggregationOptions): Promise<number> {
        query = _.cloneDeep(query);
        query.push({$count: "count_aggregate"});

        const data = await this.native().aggregate(query, options).toArray();

        if (data.length) {
            return data[0]['count_aggregate']
        }
        return 0;
    }


    /**
     * Paginate Find.
     * @param query
     * @param options
     * @param page
     * @param perPage
     * @return {Promise<{total: *, perPage: number, lastPage: number, data: [], page: number}>}
     */
    static async paginate(page: number = 1, perPage: number = 20, query = {}, options: FindOneOptions<any> = {}): Promise<PaginationData> {
        page = Number(page);
        perPage = Number(perPage);

        const total = await this.count(query);
        const lastPage = Math.ceil(total / perPage);
        const skips = perPage * (page - 1);

        /**
         * options as any is used here because mongodb did not make its new
         * WithoutProjection<FindOneOptions<TsSchema>> type exportable so we can't make reference to it.
         */
        const data = await this.native().find(query, options as any).skip(skips).limit(perPage).toArray();

        return {
            total,
            perPage,
            page,
            lastPage,
            data
        }
    }

    /**
     * Paginate Aggregation.
     * @param {number} page
     * @param {number} perPage
     * @param {[]} query
     * @param {*} options
     * @returns {Promise<{total: (*|number), perPage: number, lastPage: number, data: *, page: number}>}
     */
    static async paginateAggregate(page = 1, perPage = 20, query: any[] = [], options: CollectionAggregationOptions = {}): Promise<PaginationData> {
        query = _.cloneDeep(query);

        page = Number(page);
        perPage = Number(perPage);

        const total = await this.countAggregate(query);
        const lastPage = Math.ceil(total / perPage);
        const skips = perPage * (page - 1);

        query.push({$skip: skips});
        query.push({$limit: perPage});

        const data = await this.native().aggregate(query, options).toArray();

        return {
            total,
            perPage,
            page,
            lastPage,
            data
        }
    }

    /**
     * Turn array provided to model instances.
     *
     * if function is passed instead of the array
     * xpress-mongo will assume you want to provide a raw query
     * that it will append mongodb `.toArray` function to.
     *
     * @example
     * E.G
     *      contact = ContactModel.fromArray([...SomeAlreadyFetchedData])
     *
     * OR
     *      contact = ContactModel.fromArray(raw => raw.find().limit(10));
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
     *
     * @return {Promise<this[]>|this[]} returns - Array of model instances
     */
    static fromArray<T extends typeof XMongoModel>(this: T, query: FunctionWithRawArgument | any[], interceptor: boolean | { (lists: Array<any>): any } = false): InstanceType<T>[] | Promise<InstanceType<T>[]> {
        if (typeof query === "function") {
            return new Promise((resolve, reject) => {
                return (<Cursor>query(this.native())).toArray((error, lists) => {
                    if (error) return reject(error);

                    /**
                     * Check if interceptor is a function
                     * if it is we pass list to the function
                     *
                     * else we pass it to self (fromArray)
                     */
                    return resolve(typeof interceptor === "function" ? interceptor(lists) : this.fromArray(lists));
                });
            });
        } else {
            const data = [];
            for (const list of query) {
                data.push(this.use(list))
            }
            return data;
        }
    }

    /**
     * A helper to fetch result as array.
     * @param query - a function
     * @returns {Promise<[]>}
     */
    static toArray(query: FunctionWithRawArgument): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (typeof query !== "function") return reject(Error('.toArray expects a function as argument'));

            (<Cursor>query(this.native())).toArray((error, data) => {
                if (error) return reject(error);
                return resolve(data);
            });
        });
    }


    /**
     * Register Events for create, update and delete
     * @param event
     * @param functionOrFunctions
     */
    static on(
        event: "create" | "update" | "delete" | "create.fieldName" | "update.fieldName" | "watch.fieldName" | string,
        functionOrFunctions: onEvent
    ) {
        if (!this.events) this.events = {};

        if (event === "delete" && typeof functionOrFunctions !== "function") {
            throw Error("on('delete') event must be type of Function.")
        }

        if (event === "watch" && typeof functionOrFunctions !== "object") {
            throw Error("on('watch') event must be type of Object.")
        }

        const dots: string[] = event.split('.');

        if (dots.length > 2) {
            let [main, ...others]: any = dots;
            others = others.join('.');

            if (this.events[main]) {
                this.events[main][others] = functionOrFunctions;
            } else {
                this.events[main] = {[others as string]: functionOrFunctions};
            }
        } else {
            _.set(this.events, event, functionOrFunctions);
        }
    }
}

type FunctionWithModelInstance = (modelInstance: XMongoModel) => (void | any);
type onEvent = FunctionWithModelInstance | { [key: string]: FunctionWithModelInstance };

export = XMongoModel;
