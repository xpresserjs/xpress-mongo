import { Client } from "../index";

const db = "mongodb://127.0.0.1:27017";
const db_name = "test_model";

export = async () => {
    const connection = Client(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        // Try Connecting...
        await connection.connect();
        // Set Database name
        connection.useDb(db_name);

        console.log("Connected to mongodb");
    } catch (e) {
        throw e;
    }

    return connection;
};
