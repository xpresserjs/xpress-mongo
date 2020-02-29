const Database = require('./connection');


const ContactSchema = is => ({
    user_id: is.ObjectId(),
    first_name: is.String().required(),
    last_name: is.String().required(),
    phone: is.String(),
    created_at: is.Date()
});

class Contacts extends Database.model("contacts") {
    constructor() {
        super();
        this.useSchema(ContactSchema);
    }
}

const UserSchema = is => ({
    type: is.String().required(),
    email: is.String().required(),
    first_name: is.String().required(),
    last_name: is.String().required(),
    verified: is.Boolean().required(),
    updated_at: is.Date().required(),
    address: is.String(),
    created_at: is.Date().required()
});


const GuestSchema = is => ({
    type: is.String().required(),
    first_name: is.String().required(),
    last_name: is.String().required(),
    guestId: is.String().required(),
    created_at: is.Date().required()
});


class Users extends Database.model("users") {
    constructor() {
        super();

        this.addSchema('GuestSchema', GuestSchema);
        this.addSchema('UserSchema', UserSchema);

        this.useSchema('UserSchema');
    }

    static append = ['fullName'];

    fullName() {
        return `${this.data.first_name} ${this.data.last_name}`
    }

    static relationships = {
        contact: {
            type: 'hasOne',
            model: Contacts,
            where: {user_id: '_id'},
            options: {projection: {_id: 1}}
        }
    };
}

/**
 * @type {typeof Users| typeof XMongoModel}
 */
exports.Users = Users;
/**
 * @type {typeof Contacts| typeof XMongoModel}
 */
exports.Contacts = Contacts;
