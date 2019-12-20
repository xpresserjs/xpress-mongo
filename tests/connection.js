const {Client} = require('../index');

const db = "mongodb://localhost:27017";
const db_name = "test_model";
const db_options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

/**
 * Export Client
 * @type {XMongoClient}
 */
module.exports = Client(db, db_options).connect((err) => {
    console.log(`DB Connection Error: ${err.message}`);
    process.exit();
}).useDb(db_name);