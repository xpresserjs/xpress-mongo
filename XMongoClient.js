const XMongoModel = require('./XMongoModel');


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
    constructor(client) {
        // Save instance client.
        this.client = client
    }

    /**
     * Connect to database
     * @return {Promise<XMongoClient>}
     */
    connect() {
        this.state = STATES.connecting;
        this._connection = this.client.connect();

        return new Promise((resolve, reject) => {
            this._connection.then(() => {

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
    useDb(name) {
        this.db = this.client.db(name);
        return this;
    }

    /**
     * Connection not found!
     * @return {Promise<MongoClient>}
     */
    connection() {
        if (this.state === STATES.null) {
            throw Error`No connection found yet.`
        } else if (this.state === STATES.connecting) {
            return Promise.resolve(this._connection);
        }
    }

    /**
     * Creates a model using current connection
     * @param collection
     * @return {typeof XMongoModel}
     */
    model(collection) {
        const connection = this.db.collection(collection);

        /**
         * Extend XMongoModel
         */
        return class extends XMongoModel {
            static raw = connection;
        }
    }
}

/**
 * Mongo Client.
 * @type {MongoClient|null}
 */
XMongoClient.prototype.client = null;

/**
 * Mongo Database.
 * @type {Db|null}
 */
XMongoClient.prototype.db = null;

/**
 * Instance Connection State.
 * @type {number}
 */
XMongoClient.prototype.state = STATES.null;


module.exports = XMongoClient;