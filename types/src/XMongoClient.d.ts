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
    connection(): Promise<MongoClient | undefined> | undefined;
    /**
     * Creates a model using current connection
     * @param collection
     * @return {typeof XMongoModel}
     */
    model(collection: string): {
        new (): {
            data: import("./CustomTypes").StringToAnyObject;
            $data: import("object-collection");
            original: import("./CustomTypes").StringToAnyObject;
            schema: import("./CustomTypes").StringToAnyObject; /**
             * Use Database
             * @param name
             */
            schemaStore: import("./CustomTypes").StringToAnyObject;
            loadedRelationships: string[];
            emptyData(replaceWith?: import("./CustomTypes").StringToAnyObject | undefined): any;
            get(key: string, $default?: any): any;
            set(key: string | import("./CustomTypes").StringToAnyObject, value?: any): any;
            setOriginal(data: import("./CustomTypes").StringToAnyObject): any;
            addSchema(name: string, schema: import("./CustomTypes").StringToAnyObject): any;
            setSchema(schema: any): any;
            useSchema(schema: string | import("./CustomTypes").StringToAnyObject | ((is: import("./XMongoSchemaBuilder").XMongoSchemaBuilder) => import("./CustomTypes").StringToAnyObject)): any;
            id(): any;
            idEqualTo(to: any, key?: string): boolean;
            changes(): import("./CustomTypes").StringToAnyObject;
            update(set: import("./CustomTypes").StringToAnyObject, options: import("mongodb").UpdateOneOptions): Promise<boolean | import("mongodb").UpdateWriteOpResult | import("mongodb").InsertOneWriteOpResult<any>>;
            save(options?: import("mongodb").CollectionInsertOneOptions | import("mongodb").UpdateOneOptions): Promise<boolean | import("mongodb").UpdateWriteOpResult | import("mongodb").InsertOneWriteOpResult<any>>;
            unset(keys: string | string[], options?: import("mongodb").UpdateOneOptions): Promise<import("mongodb").UpdateWriteOpResult>;
            validate(data?: import("./CustomTypes").StringToAnyObject | undefined): import("./CustomTypes").StringToAnyObject;
            delete(): Promise<import("mongodb").DeleteWriteOpResultObject>;
            toCollection(): import("object-collection");
            hasOne(relationship: string, extend?: import("./CustomTypes").StringToAnyObject): Promise<import("./CustomTypes").StringToAnyObject | XMongoModel>;
            toJSON(): import("./CustomTypes").StringToAnyObject;
            toJson(replacer?: undefined, space?: undefined): string;
        };
        raw: Collection<any>;
        relationships: import("./CustomTypes").StringToAnyObject;
        append: string[];
        new(data: import("./CustomTypes").StringToAnyObject, save?: boolean): Promise<XMongoModel>;
        isValidId(objectId: any): boolean;
        use(data: import("./CustomTypes").StringToAnyObject): XMongoModel;
        id(str: any, returnObject?: boolean): string | import("bson").ObjectId | {
            _id: string | import("bson").ObjectId;
        };
        find(query: import("./CustomTypes").StringToAnyObject, options?: import("mongodb").FindOneOptions, raw?: boolean): import("mongodb").Cursor<any> | Promise<XMongoModel[]>;
        fromArray(query: ((raw: Collection<any>) => import("mongodb").Cursor<any>) | import("./CustomTypes").StringToAnyObject[], interceptor?: boolean | ((lists: any[]) => any)): Promise<any[]> | XMongoModel[];
        toArray(query: (raw: Collection<any>) => import("mongodb").Cursor<any>): Promise<any[]>;
        findOne(query: import("./CustomTypes").StringToAnyObject, options?: boolean | import("mongodb").FindOneOptions, raw?: boolean): Promise<XMongoModel | null>;
        findById(_id: any, options?: import("mongodb").FindOneOptions, isTypeObjectId?: boolean): Promise<XMongoModel | null>;
        count(query: import("./CustomTypes").StringToAnyObject, options?: import("mongodb").FindOneOptions | undefined): Promise<number>;
        countAggregate(query: any[], options?: import("mongodb").CollectionAggregationOptions | undefined): Promise<number>;
        paginate(page?: number, perPage?: number, query?: {}, options?: import("mongodb").FindOneOptions): Promise<import("./CustomTypes").PaginationData>;
        paginateAggregate(page?: number, perPage?: number, query?: any[], options?: import("mongodb").CollectionAggregationOptions): Promise<import("./CustomTypes").PaginationData>;
    };
}
export = XMongoClient;
