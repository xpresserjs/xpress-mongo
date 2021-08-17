import { Client } from "../index";

const db = "mongodb://127.0.0.1:27017";
const db_name = "xpress-mongo";

export = async () => {
    const connection = Client(db);

    try {
        // Try Connecting...
        await connection.connect();
        // Set Database name
        connection.useDb(db_name);
    } catch (e) {
        throw e;
    }

    return connection;
};
