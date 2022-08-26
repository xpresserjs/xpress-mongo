import XMongoModel from "./XMongoModel";
import {Collection, Db, MongoClient} from "mongodb";
import XMongoTypedModel from "./XMongoTypedModel";
import {StringToAnyObject} from "./types/index";

/**
 * States
 * @type {{connected: number, disconnected: number, connecting: number}}
 */
const STATES = {
    null: 0,
    connected: 2,
    connecting: 1,
    disconnected: -1,
    closed: 3
};

class XMongoClient {
    // Mongo Client
    client: MongoClient;
    // Mongo Database
    db: Db | undefined;
    // Current State
    state: number = STATES.null;
    // Current Connection
    _connection: Promise<MongoClient> | undefined;

    constructor(client: MongoClient) {
        // Save instance client.
        this.client = client;
    }

    /**
     * Connect to database
     * @return {Promise<XMongoClient>}
     */
    connect(): Promise<XMongoClient> {
        this.state = STATES.connecting;
        this._connection = this.client.connect();

        return new Promise((resolve, reject) => {
            (<Promise<MongoClient>>this._connection)
                .then(() => {
                    this.state = STATES.connected;
                    return resolve(this);
                })
                .catch((err) => {
                    this.state = STATES.disconnected;
                    return reject(err);
                });
        });
    }

    /**
     * Use Database
     * @param name
     */
    useDb(name: string): this {
        this.db = this.client.db(name);
        return this;
    }

    /**
     * Connection
     * @return {Promise<MongoClient>}
     */
    connection(): Promise<MongoClient | undefined> | void {
        if (this.state === STATES.null) {
            throw new Error(`No connection found yet.`);
        } else if (this.state === STATES.connecting) {
            return Promise.resolve(this._connection);
        }
    }

    /**
     * Get collection from current connection.
     * @param name
     */
    collection(name: string): Collection {
        return (<Db>this.db).collection(name);
    }

    /**
     * Creates a model using current connection
     * @param collection
     * @param model
     * @return {typeof XMongoModel}
     */
    model(collection: string, model?: typeof XMongoModel): typeof XMongoModel {
        const connection: Collection = this.collection(collection);

        if (model) {
            model.native = function (): Collection {
                return connection;
            };
            return model;
        } else {
            /**
             * Extend XMongoModel
             */
            return <typeof XMongoModel>(<unknown>class extends XMongoModel {
                /**
                 * Returns native mongodb instance to run native queries
                 */
                static native(): Collection {
                    return connection;
                }
            });
        }
    }

    /**
     * Alias of .model but to link model classes
     * @param model
     */
    linkModel<T extends typeof XMongoModel>(model: T) {
        const collectionName = model.collectionName;

        if (!collectionName)
            throw new Error(`Collection name is not defined in model ${model.name}`);

        return this.link(model, collectionName);
    }

    /**
     * Creates a model using current connection
     * @param collection
     * @return {typeof XMongoModel}
     */
    typedModel<DT extends StringToAnyObject>(collection: string): XMongoTypedModel<DT> {
        const connection: Collection = this.collection(collection);
        /**
         * Extend XMongoModel
         */
        return <XMongoTypedModel<DT>>(<unknown>class extends XMongoTypedModel {
            /**
             * Returns native mongodb instance to run native queries
             */
            static native(): Collection {
                return connection;
            }
        });
    }

    /**
     * Link a model to a "collection"
     * @param model
     * @param collection
     *
     * @example
     *  class MyModel extends XMongoModel {}
     *
     *  client.link(MyModel, "my_model_collection");
     */
    link(model: any, collection: string) {
        this.model(collection, model);
        return this;
    }
}

export = XMongoClient;
