const Database = require('./connection');
const {is} = require('../index');


const UserSchema = {
    _id: is.ObjectId(),
    email: is.String().required(),
    first_name: is.String().required(),
    last_name: is.String().required(),
    verified: is.Boolean(),
    created_at: is.Date()
};


class User extends Database.model("users") {
    constructor(data = {}) {
        super();
        this.set(data);
        this.setSchema(UserSchema);
    }
}

module.exports = User;