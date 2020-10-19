import XMongoModel = require('./XMongoModel');
import { Collection, Db, MongoClient } from "mongodb";
declare class XMongoClient {
    client: MongoClient;
    db: Db | undefined;
    state: number;
    _connection: Promise<MongoClient> | undefined;
    constructor(client: MongoClient);
    /**
     * Connect to database
     * @return {Promise<XMongoClient>}
     */
    connect(): Promise<XMongoClient>;
    /**
     * Use Database
     * @param name
     */
    useDb(name: string): this;
    /**
     * Connection not found!
     * @return {Promise<MongoClient>}
     */
    connection(): Promise<MongoClient | undefined> | void;
    /**
     * Get collection from current connection.
     * @param name
     */
    collection(name: string): Collection;
    /**
     * Creates a model using current connection
     * @param collection
     * @param model
     * @return {typeof XMongoModel}
     */
    model(collection: string, model?: typeof XMongoModel): typeof XMongoModel;
}
export = XMongoClient;
