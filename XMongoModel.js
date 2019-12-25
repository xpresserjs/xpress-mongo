const {ObjectID} = require('mongodb');
const {ModelDataType} = require('./DataTypes');
const {diff} = require('deep-object-diff');
const ObjectCollection = require('object-collection');
const _ = ObjectCollection._;

/**
 * Returns a model class tied to the given collection.
 * @param collection {Collection} - This connection
 * @returns {XMongoModel}
 * @constructor
 */
function GenerateModel(collection) {

    class XMongoModel {

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
                write: true,
                enumerable: false
            });

            Object.defineProperty(this, 'loadedRelationships', {
                value: [],
                write: true,
                enumerable: false
            })
        }
    }

    /**
     * Model Data
     * @type {*}
     */
    XMongoModel.prototype.data = {};


    /**
     * Model Data
     * @type {ObjectCollection}
     */
    XMongoModel.prototype.$data = new ObjectCollection;

    /**
     * Model Original Data
     * @type {*}
     */
    XMongoModel.prototype.original = {};

    /**
     * Model Schema
     * @private
     * @type {{}}
     */
    XMongoModel.prototype.schema = {};

    /** Model Loaded Relationships
     * @private
     * @type {*[]}
     */
    XMongoModel.prototype.loadedRelationships = [];


    /**
     * Get Data in model
     * @param key
     * @return {*|undefined}
     */
    XMongoModel.prototype.get = function (key, $default) {
        return _.get(this.data, key, $default);
    };

    /**
     * Set data in model
     * @param key
     * @param value
     * @return {XMongoModel}
     */
    XMongoModel.prototype.set = function (key, value) {
        if (typeof key === 'object' && value === undefined) {
            for (const property in key) {
                _.set(this.data, property, key[property])
            }
        } else if (typeof key === 'string') {
            _.set(this.data, key, value)
        }
        return this;
    };


    /**
     * Insert new record and return instance.
     * @param data
     * @return {Promise<this|*>}
     */
    XMongoModel.new = async function (data) {
        const record = new this().set(data);
        await record.save();
        return record;
    };


    /**
     * Set Original result gotten from db
     * @param data
     * @return {XMongoModel}
     */
    XMongoModel.prototype.setOriginal = function (data) {
        data = _.cloneDeep(data);

        Object.defineProperty(this, 'original', {
            value: data,
            write: true,
            enumerable: false
        });

        return this;
    };


    /**
     * Set Model Schema
     *
     * if `schema` is undefined then `this.data` is used as schema object
     * @param schema
     * @returns {XMongoModel}
     */
    XMongoModel.prototype.setSchema = function (schema = undefined) {
        const schemaIsData = schema === undefined;
        schema === undefined && (schema = this.data);
        const newData = {_id: null};


        for (const key in schema) {
            if (schema.hasOwnProperty(key)) {
                const val = schema[key];

                if (val instanceof ModelDataType) {
                    this.schema[key] = val['schema'];
                }

                const dataVal = this.data[key];
                const dataValIsNotBoolean = typeof dataVal !== "boolean";

                if (!schemaIsData && dataValIsNotBoolean && !dataVal) {
                    newData[key] = val['schema'].default;
                } else if (schemaIsData && dataVal instanceof ModelDataType) {
                    newData[key] = dataVal['schema'].default
                } else {
                    newData[key] = dataVal
                }
            }
        }

        /**
         * Fill up keys defined in data but not in schema
         */
        for (const key in this.data) {
            if (!newData.hasOwnProperty(key)) {
                newData[key] = this.data[key]
            }
        }

        this.data = newData;

        return this;
    };


    XMongoModel.prototype.id = function () {
        return (this.data && this.data['_id']) || null
    };

    /**
     * See changes made so far.
     * @return {*}
     */
    XMongoModel.prototype.changes = function () {
        const changes = diff(this.original, this.data);
        const data = {};
        const append = this.constructor.append || [];
        const excluded = [...append, ...this.loadedRelationships];

        for (const key in changes) {
            if (!excluded.includes(key)) {
                data[key] = this.data[key]
            }
        }

        return data;
    };

    /**
     * Update model
     * @param set
     * @param options
     * @return {Promise<Collection~updateWriteOpResult|Collection~insertOneWriteOpResult>}
     */
    XMongoModel.prototype.update = function (set, options) {
        if (!this.id()) throw "Model does not have an _id, so we assume it is not from the database.";
        return this.set(set).save(options)
    };

    /**
     * Create Model if not id is missing or save document if id is found.
     * @param options
     * @return {Promise<Collection~updateWriteOpResult|Collection~insertOneWriteOpResult>}
     */
    XMongoModel.prototype.save = function (options) {
        return new Promise((resolve, reject) => {
            const id = this.id();

            if (id) {
                const $set = this.changes();
                if (!Object.keys($set).length) return resolve(false);

                return collection.updateOne(
                    {_id: this.id()},
                    {$set},
                    options,
                    (error, res) => error ? reject(error) : resolve(res.connection))
            } else {
                return collection.insertOne(
                    this.data,
                    options,
                    (error, res) => {
                        if (error) return reject(error);
                        const {insertedId} = res;

                        this.set('_id', insertedId);
                        this.setOriginal(this.data);

                        return resolve(res)
                    })
            }
        });
    };

    /**
     * Sets data as an instance of ObjectCollection on this.$data
     * @return {ObjectCollection}
     */
    XMongoModel.prototype.toCollection = function () {
        if (!this.hasOwnProperty('$data')) {
            Object.defineProperty(this, '$data', {
                value: new ObjectCollection(this.data),
                writable: true,
                enumerable: false
            });

            return this.$data;
        }

        return this.$data;
    };


    XMongoModel.prototype.hasOne = async function (relationship, extend = {}) {
        let config = this.constructor.relationships;
        if (config && config.hasOwnProperty(relationship)) {
            config = config[relationship];
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
            let options = _.cloneDeep(config['options'] || {});
            if (extend.hasOwnProperty('options')) options = _.cloneDeep(extend.options);


            /**
             * Get Relationship where query.
             * @type {*}
             */
            let where = _.clone(config.where);
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
             * @type {typeof XMongoModel}
             */
            let model = config.model;
            if (Array.isArray(model) && typeof model[0] === "function")
                model = model[0]();

            let relatedData = await model.raw.findOne(where, options);

            if (cast && relatedData) relatedData = model.use(relatedData);

            /**
             * Set relationship to value provided in the extend.as config.
             */
            if (extend['as']) relationship = extend['as'];

            this.set(relationship, relatedData);
            this.loadedRelationships.push(relationship);

            return relatedData;
        }
    };


    /**
     * @private
     * @return {*}
     */
    XMongoModel.prototype.toJSON = function () {
        return this.data;
    };


    XMongoModel.prototype.toJson = function (replacer = undefined, space = undefined) {
        return JSON.stringify(this.data, replacer, space);
    };


    XMongoModel.prototype.emptyData = function () {
        this.data = {
            _id: this.id()
        };

        return this;
    };

    /**
     * Direct mongodb access
     * @type {Collection}
     */
    XMongoModel.raw = collection;


    /**
     * Alias to mongo.ObjectID
     * @param str {*}
     * @param returnObject
     * @return {*}
     */
    XMongoModel.id = (str, returnObject = false) => {
        let _id;

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
    };


    /**
     * Find many in collection
     * @param query
     * @param options
     * @param raw
     * @return {Promise<XMongoModel[]>}
     */
    XMongoModel.find = (query, options, raw = false) => {
        const result = collection.find(query, options);
        if (raw) return result;

        return new Promise((resolve, reject) => {
            return result.toArray((error, data) => {
                if (error) return reject(error);
                return resolve(data);
            });
        });
    };

    /**
     * Turn data provided in query function to model instances.
     * @param {{}} data
     * @return {XMongoModel}
     */
    XMongoModel.use = function (data) {
        const model = new this();
        model.emptyData();
        // Set Original Property
        model.setOriginal(data);
        model.set(data);

        if (this.append) {
            for (const key of this.append) {
                if (typeof model[key] === "function") {
                    model.set(key, model[key]())
                }
            }
        }

        return model;
    };


    /**
     * @callback rawQueryFn
     * @param {Collection|*} raw
     */

    /**
     * Turn array provided to model instances.
     *
     * if function is passed instead of the array
     * xpress-mongo will assume you want to provide a raw query
     * that it will append mongodb `.toArray` function to.
     *
     * E.G
     *      contact = ContactModel.fromArray([...SomeAlreadyFetchedData])
     *
     * OR
     *      contact = ContactModel.fromArray(raw => raw.find().limit(10));
     *
     * WHICH IS ===
     *
     *      Model.raw.find().limit(10).toArray((err, lists) => {
     *          Model.fromArray();
     *      })
     *
     *
     * @static
     * @method
     * @param {rawQueryFn|Object[]} query - Data as array or query as function.
     * @return {Promise<this[]>|this[]} returns - Array of model instances
     */
    XMongoModel.fromArray = function (query) {
        if (typeof query === "function") {
            return new Promise((resolve, reject) => {
                return query(this.raw).toArray((error, lists) => {
                    if (error) return reject(error);
                    return resolve(this.fromArray(lists));
                });
            });
        } else {
            const data = [];
            for (const list of query) {
                data.push(this.use(list))
            }
            return data;
        }

    };

    /**
     *
     * @param {rawQueryFn} query
     * @return {Promise<this>|XMongoModel}
     */
    XMongoModel.from = function (query) {
        return new Promise((resolve, reject) => {
            return query(this.raw).then((error, data) => {
                if (error) return reject(error);
                return resolve(this.use(data));
            });
        });
    };


    /**
     * Fetches the first document that matches the query
     * @param query
     * @param options
     * @param raw
     * @return {Promise<XMongoModel>}
     */
    XMongoModel.findOne = function (query, options, raw = false) {

        if (typeof options === "boolean") {
            raw = options;
            options = {};
        }

        return new Promise((resolve, reject) => {
            return collection.findOne(query, options, (error, data) => {
                if (error) return reject(error);
                // Return new instance of Model
                if (!data) return resolve(null);
                if (raw) return resolve(data);

                return resolve(this.use(data));
            });
        });
    };


    /**
     * Fetches the first document that matches id provided.
     * @param _id
     * @param options
     * @param isTypeObjectId
     * @return {Promise<XMongoModel>}
     */
    XMongoModel.findById = function (_id, options = {}, isTypeObjectId = true) {
        let where;
        if (typeof _id === "string" || !isTypeObjectId) {
            where = XMongoModel.id(_id, true);
        } else {
            where = {_id}
        }

        return this.findOne(where, options);
    };

    /**
     * Count All the documents that match query.
     * @param query
     * @param options
     * @return {void | * | Promise | undefined | IDBRequest<number>}
     */
    XMongoModel.count = function (query, options) {
        return this.raw.find(query, options).count()
    };


    /**
     * Count Aggregations
     * @param query
     * @param options
     * @returns {Promise<number|*>}
     */
    XMongoModel.countAggregate = async function (query, options) {
        query = _.cloneDeep(query);

        query.push({$count: "count_aggregate"});
        const data = await this.raw.aggregate(query, options).toArray();
        if (data.length) {
            return data[0]['count_aggregate']
        }
        return 0;
    };


    /**
     * Paginate Find.
     * @param query
     * @param options
     * @param page
     * @param perPage
     * @return {Promise<{total: *, perPage: number, lastPage: number, data: [], page: number}>}
     */
    XMongoModel.paginate = async function (page = 1, perPage = 20, query = {}, options = {}) {
        page = Number(page);
        perPage = Number(perPage);

        const total = await this.count(query);
        const lastPage = Math.ceil(total / perPage);
        const skips = perPage * (page - 1);
        const data = await this.raw.find(query, options).skip(skips).limit(perPage).toArray();

        return {
            total,
            perPage,
            page,
            lastPage,
            data
        }
    };

    /**
     * Paginate Aggregation.
     * @param {number} page
     * @param {number} perPage
     * @param {[]} query
     * @param {*} options
     * @returns {Promise<{total: (*|number), perPage: number, lastPage: number, data: *, page: number}>}
     */
    XMongoModel.paginateAggregate = async function (page = 1, perPage = 20, query = [], options = {}) {
        query = _.cloneDeep(query);

        page = Number(page);
        perPage = Number(perPage);

        const total = await this.countAggregate(query);
        const lastPage = Math.ceil(total / perPage);
        const skips = perPage * (page - 1);

        query.push({$skip: skips});
        query.push({$limit: perPage});

        console.log(query);

        const data = await this.raw.aggregate(query, options).toArray();

        return {
            total,
            perPage,
            page,
            lastPage,
            data
        }
    };

    return XMongoModel;
}

module.exports = GenerateModel;
