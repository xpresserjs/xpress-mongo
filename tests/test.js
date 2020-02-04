const {Client} = require('../index');
const mongodb = require('mongodb');

mongodb.MongoClient.connect(
    'mongodb://localhost/test_model',
    {useNewUrlParser: true, useUnifiedTopology: true}
).then(async client => {
    const Database = Client(client).useDb('test_model');
    const UserModel = Database.model('users');

    console.log(await UserModel.findOne())
}).catch(err => {
    console.log(err);
});