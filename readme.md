# Xpress-Mongo
---- Still in development

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

class User extends Collection("users") {
    constructor() {
        super();
        this.setSchema(UserSchema);
    }
}

module.exports = User;
```

### Data
```javascript
const user = new User().set({
    first_name: 'John',
    last_name: 'Doe'
});


console.log(user.get('created_at'));
// Current Date
```