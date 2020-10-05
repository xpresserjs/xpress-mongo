import ObjectCollection = require('object-collection');
import { ObjectID, Collection, UpdateWriteOpResult, InsertOneWriteOpResult, DeleteWriteOpResultObject, Cursor, FindOneOptions, UpdateOneOptions, CollectionInsertOneOptions, CollectionAggregationOptions, AggregationCursor, UpdateQuery, FilterQuery } from 'mongodb';
import { XMongoSchemaBuilder } from './XMongoSchemaBuilder';
import { PaginationData, StringToAnyObject } from "./CustomTypes";
declare type FunctionWithRawArgument = {
    (raw: Collection): Cursor | AggregationCursor;
};
/**
 * @class
 */
declare class XMongoModel {
    /**
     * Model Data
     * @type {*}
     */
    data: StringToAnyObject;
    /**
     * Model Data
     * @type {ObjectCollection}
     */
    $data: ObjectCollection | undefined;
    /**
     * Model Original Data
     * @type {*}
     */
    private original;
    /**
     * Model Schema
     * @private
     * @type {{}}
     */
    schema: StringToAnyObject;
    /**
     * Model Schema Store
     * @private
     * @type {{}}
     */
    schemaStore: StringToAnyObject;
    /**
     * Defined relationships
     * @type {{}}
     */
    static relationships: StringToAnyObject;
    /** Model Loaded Relationships
     * @private
     * @type {*[]}
     */
    private loadedRelationships;
    /**
     * Direct mongodb access
     * @type {Collection|null}
     * @deprecated - use thisCollection()
     */
    static raw: Collection;
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
    constructor();
    /**
     * Use `.native()` instead
     * @deprecated (v 0.0.40)
     */
    static thisCollection(): Collection;
    /**
     * Returns native mongodb instance to run native queries
     */
    static native(): Collection;
    /**
     * Empties data in current model.
     * @param replaceWith
     * @returns {this}
     */
    emptyData(replaceWith?: StringToAnyObject): this;
    /**
     * Get Data in model
     * @param key
     * @param $default
     * @return {*|undefined}
     */
    get(key: string, $default?: any): any;
    /**
     * Set data in model
     * @param key
     * @param value
     * @return {this}
     */
    set(key: string | StringToAnyObject, value?: any): this;
    /**
     * Push element to model
     * @param key
     * @param value
     * @param strict
     * @return {this}
     */
    pushToArray(key: string, value: any, strict?: boolean): this;
    /**
     * Find data in array
     * @param key
     * @param value
     */
    findInArray(key: string, value: any): any;
    /**
     * Insert new record and return instance.
     * @param data - new record data.
     * @param save - Save new date, default = true
     * @return {Promise<this|*>}
     */
    static new<T extends XMongoModel>(data: StringToAnyObject, save?: boolean): Promise<T>;
    /**
     * Creates instance.
     * @desc
     * Just like .new but unlike .new it does not save the record to the database it to the database
     * @param data - new record data.
     * @return {Promise<this|*>}
     */
    static make<T extends XMongoModel>(data: StringToAnyObject): T;
    /**
     * Check if id is a valid id
     * @param id
     * @return {boolean}
     */
    static isValidId(id: any): boolean;
    /**
     * Set Original result gotten from db
     * @param data
     * @return {this}
     */
    setOriginal(data: StringToAnyObject): this;
    /**
     * Set multiple schemas and use them at anytime using `.setSchema`
     * @param {string} name
     * @param {Object} schema
     * @return {this}
     */
    addSchema(name: string, schema: StringToAnyObject): this;
    /**
     * Set Model Schema
     *
     * if `schema` is undefined then `this.data` is used as schema object
     * @param {Object|string} schema
     * @returns {this}
     *
     * @deprecated
     */
    setSchema(schema: any): this;
    /**
     * Set Model Schema
     *
     * if `schema` is undefined then `this.data` is used as schema object
     * @param {Object|String} schema
     * @returns {this}
     */
    useSchema(schema: string | StringToAnyObject | {
        (is: XMongoSchemaBuilder): StringToAnyObject;
    }): this;
    /**
     * Get id of current model instance
     * @returns {*|ObjectID|null}
     */
    id(): any | ObjectID | null;
    /**
     * Compare model id with a string or ObjectId type variable.
     * @param to
     * @param key
     * @returns {boolean}
     */
    idEqualTo(to: any, key?: string): boolean;
    /**
     * See changes made so far.
     * @return {*}
     */
    changes(): StringToAnyObject;
    /**
     * Update model
     * @param set
     * @param options
     * @return {Promise<UpdateWriteOpResult>}
     */
    update(set: StringToAnyObject, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
    /**
     * Update model using raw updateQuery
     * @param update
     * @param options
     * @return {Promise<UpdateWriteOpResult>}
     */
    updateRaw(update: UpdateQuery<any> | Partial<any>, options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
    /**
     * Create Model if not id is missing or save document if id is found.
     * @param options
     * @param create
     * @return {Promise<UpdateWriteOpResult | InsertOneWriteOpResult<*>>}
     */
    save(options?: UpdateOneOptions | CollectionInsertOneOptions, create?: boolean): Promise<boolean | UpdateWriteOpResult | InsertOneWriteOpResult<any>>;
    /**
     * Unset a key or keys from this collection
     * @param {string|[]} keys - Key or Keys to unset from collection
     * @param {Object} options - Update options
     */
    unset(keys: string | string[], options?: UpdateOneOptions): Promise<UpdateWriteOpResult>;
    /**
     * Validate
     * @description
     * Runs validation on this.data if data is undefined.
     * @param data
     * @return {{}}
     */
    validate(data?: StringToAnyObject): StringToAnyObject;
    /**
     * Delete this
     * @returns {Promise}
     */
    delete(): Promise<DeleteWriteOpResultObject>;
    /**
     * Sets data as an instance of ObjectCollection on this.$data
     * @return {ObjectCollection}
     */
    toCollection(): ObjectCollection;
    /**
     * Use data provided to model instance.
     * @param {{}} data
     */
    static use(data: StringToAnyObject): XMongoModel;
    /**
     * Has One relationship
     * @param relationship
     * @param extend
     */
    hasOne(relationship: string, extend?: StringToAnyObject): Promise<any | XMongoModel>;
    /**
     * toJSON converter.
     * @private
     * @return {*}
     */
    toJSON(): StringToAnyObject;
    /**
     * Converts this.data to json using JSON.stringify()
     * @param replacer
     * @param space
     */
    toJson(replacer?: undefined, space?: undefined): string;
    /**
     * Alias to mongo.ObjectID
     * @param str {*}
     * @param returnObject
     * @return {*}
     */
    static id(str: any, returnObject?: boolean): (ObjectID | string) | {
        _id: ObjectID | string;
    };
    /**
     * Find many in collection
     * @param query
     * @param options
     * @param raw
     * @return {Promise<XMongoModel[]>}
     */
    static find(query?: (StringToAnyObject | FilterQuery<any>), options?: FindOneOptions<any>, raw?: boolean): Promise<XMongoModel[]> | Cursor;
    /**
     * Fetches the first document that matches the query
     * @param query
     * @param options
     * @param raw
     */
    static findOne<T extends XMongoModel>(query?: (StringToAnyObject | FilterQuery<any>), options?: FindOneOptions<any> | boolean, raw?: boolean): Promise<T | null>;
    /**
     * Fetches the first document that matches id provided.
     * @param _id
     * @param options
     * @param isTypeObjectId
     * @return {Promise<XMongoModel>}
     */
    static findById(_id: any, options?: FindOneOptions<any>, isTypeObjectId?: boolean): Promise<XMongoModel | null>;
    /**
     * Count All the documents that match query.
     * @param query
     * @param options
     * @return {void | * | Promise | undefined | IDBRequest<number>}
     */
    static count(query?: (StringToAnyObject | FilterQuery<any>), options?: FindOneOptions<any>): Promise<number>;
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
    static sum(fields: string | StringToAnyObject | string[], match?: StringToAnyObject): Promise<number | {
        [name: string]: number;
    }>;
    /**
     * Count Aggregations
     * @param query
     * @param options
     * @returns {Promise<number|*>}
     */
    static countAggregate(query?: any[], options?: CollectionAggregationOptions): Promise<number>;
    /**
     * Paginate Find.
     * @param query
     * @param options
     * @param page
     * @param perPage
     * @return {Promise<{total: *, perPage: number, lastPage: number, data: [], page: number}>}
     */
    static paginate(page?: number, perPage?: number, query?: {}, options?: FindOneOptions<any>): Promise<PaginationData>;
    /**
     * Paginate Aggregation.
     * @param {number} page
     * @param {number} perPage
     * @param {[]} query
     * @param {*} options
     * @returns {Promise<{total: (*|number), perPage: number, lastPage: number, data: *, page: number}>}
     */
    static paginateAggregate(page?: number, perPage?: number, query?: any[], options?: CollectionAggregationOptions): Promise<PaginationData>;
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
    static fromArray(query: FunctionWithRawArgument | any[], interceptor?: boolean | {
        (lists: Array<any>): any;
    }): XMongoModel[] | Promise<any[]>;
    /**
     * A helper to fetch result as array.
     * @param query - a function
     * @returns {Promise<[]>}
     */
    static toArray(query: FunctionWithRawArgument): Promise<any[]>;
}
export = XMongoModel;
