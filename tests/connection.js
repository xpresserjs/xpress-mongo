const {Client} = require('../index');

const db = "mongodb://127.0.0.1:27017";
const db_name = "test_model";
const db_options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};


/**
 * Export Client
 * @type {XMongoClient}
 */
module.exports = async (runAfterConnection = () => false) => {
    const connection = Client(db, db_options);
    let client;
    try {
        client = await connection.connect();
        client.useDb(db_name);

        global['Database'] = client;
    } catch (e) {
        console.log(`DB Connection Error: ${e.message}`);
        process.exit();
    }
};