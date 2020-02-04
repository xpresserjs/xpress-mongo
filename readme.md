# Xpress-Mongo
##### ---- Still in development

Xpress-Mongo is a lightweight mongodb ODM both in size and in actions.

Unlike other Mongodb ODM's, xpress keeps you closer to **mongodb-native** calls using the `raw` function available on all model instances

```javascript
// Using
const User = SomeCollection();

User.findOne(); // XpressMongo findOne
User.raw.findOne(); // Mongodb findOne
```



### Setup
Assuming you already have your client connected already..

```javascript
// Import XpressMongo
const {Client} = require('xpress-mongo');
// Use your already existing  client.
const Database = Client('your_client').useDb('database_name');

// Define models using collection names
const UserModel = Database.model('users');
const PostModel = Database.model('posts');

UserModel.findOne().then(user =>  console.log(user));
PostModel.find().then(posts =>  console.log(posts));

```

### Model
```javascript
const {is, Collection} = require('xpress-mongo');

const UserSchema = {
    _id: is.ObjectId(),
    email: is.String().required(),
    first_name: is.String().required(),
    last_name: is.String().required(),
    verified: is.Boolean(),
    created_at: is.Date()
};

class Users extends Collection("users") {
    constructor() {
        super();
        this.setSchema(UserSchema);
    }
}

module.exports = Users;
```

### Data
```javascript
const user = new Users().set({
    first_name: 'John',
    last_name: 'Doe'
});


console.log(user.get('created_at'));
// Current Date
```