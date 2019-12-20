const GenerateModel = require('./XMongoModel');

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

    connect(errorCallback) {
        this.state = STATES.connecting;

        this._connection = this.client.connect();

        this._connection.then(() => {
            this.state = STATES.connected;
        }).catch((err) => {
            this.state = STATES.disconnected;
            if (errorCallback && typeof errorCallback === "function") {
                return errorCallback(err);
            } else {
                console.log(`DB Connection Error: ${err.message}`)
            }
        });

        return this;
    }

    /**
     * Use Database
     * @param name
     */
    useDb(name) {
        this.db = this.client.db('name');
        return this;
    }

    /**
     * Connection not found!
     * @return {Promise<MongoClient>}
     */
    connection() {
        console.log(this.state);
        if (this.state === STATES.null) {
            throw Error`No connection found yet.`
        } else if (this.state === STATES.connecting) {
            return Promise.resolve(this._connection);
        }
    }

    /**
     *
     * @param collection
     * @return {typeof XMongoModel}
     */
    model(collection) {
        const connection = this.db.collection(collection);
        return GenerateModel(connection, collection)
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