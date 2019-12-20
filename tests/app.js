const {Client} = require('../index');
const db = "mongodb://localhost:27017";
const db_name = "test_model";
const db_options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};


const client = Client(db, db_options).connect((err) => {
    console.log(`DB Connection Error: ${err.message}`);
    process.exit();
}).useDb(db_name);

const Accounts =  client.model('users');
const user = new Accounts().set({
    first_name: 'John',
    last_name: 'Doe'
});

Accounts.find({}).then(data => {
    for (const ac in data) {
        console.log(ac)
    }
});



/*
const User = require("./models");

const user = new User().set({
    first_name: 'John',
    last_name: 'Doe'
});


console.log(user.get('created_at'));*/
