const Database = require('./connection');
const {is} = require('../index');


const UserSchema = {
    email: is.String().required(),
    first_name: is.String().required(),
    last_name: is.String().required(),
    verified: is.Boolean(),
    updated_at: is.Date(),
    created_at: is.Date()
};


class User extends Database.model("users") {
    constructor() {
        super();
        this.setSchema(UserSchema);
    }
}

/**
 * Return User
 * @type {User| typeof XMongoModel}
 */
module.exports = User;