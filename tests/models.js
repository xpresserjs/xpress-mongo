const Database = require('./connection');
const {is} = require('../index');


const ContactSchema = {
    user_id: is.ObjectId(),
    first_name: is.String().required(),
    last_name: is.String().required(),
    phone: is.String(),
    created_at: is.Date()
};

class Contacts extends Database.model("contacts") {
    constructor() {
        super();
        this.setSchema(ContactSchema);
    }
}

const UserSchema = {
    email: is.String().required(),
    first_name: is.String().required(),
    last_name: is.String().required(),
    verified: is.Boolean(),
    updated_at: is.Date(),
    created_at: is.Date()
};


class Users extends Database.model("users") {
    constructor() {
        super();
        this.setSchema(UserSchema);
    }

    static relationships = {
        contact: {
            type: 'hasOne',
            model: Contacts,
            where: {user_id: '_id'},
        }
    };

    fullName() {
        return `${this.data.first_name} ${this.data.last_name}`
    }
}

/**
 * Return User
 * @type {User| typeof XMongoModel}
 */
module.exports = {Users, Contacts};