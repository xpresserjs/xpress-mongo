import XMongoModel = require('./XMongoModel');
import {Collection, Db, MongoClient} from "mongodb";


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
        this.client = client
    }

    /**
     * Connect to database
     * @return {Promise<XMongoClient>}
     */
    connect(): Promise<XMongoClient> {
        this.state = STATES.connecting;
        this._connection = this.client.connect();

        return new Promise((resolve, reject) => {
            (<Promise<MongoClient>>this._connection).then(() => {

                this.state = STATES.connected;
                return resolve(this);

            }).catch(err => {

                this.state = STATES.disconnected;
                return reject(err)

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
     * Connection not found!
     * @return {Promise<MongoClient>}
     */
    connection(): Promise<MongoClient | undefined> | void {
        if (this.state === STATES.null) {
            throw new Error(`No connection found yet.`)
        } else if (this.state === STATES.connecting) {
            return Promise.resolve(this._connection);
        }
    }

    /**
     * Get collection from current connection.
     * @param name
     */
    collection(name: string): Collection {
        return (<Db>this.db).collection(name)
    }

    /**
     * Creates a model using current connection
     * @param collection
     * @return {typeof XMongoModel}
     */
    model(collection: string): typeof XMongoModel {
        const connection: Collection = this.collection(collection);

        /**
         * Extend XMongoModel
         */
        return <typeof XMongoModel><unknown>class extends XMongoModel {
            static thisCollection = () => connection;
        }
    }
}


export = XMongoClient;