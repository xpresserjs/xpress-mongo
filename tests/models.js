const {is, RefreshDateOnUpdate, XMongoModel} = require('../');
const Database = global['Database'];

const ContactSchema = {
    user_id: is.ObjectId().required(),
    first_name: is.String(),
    last_name: is.String().required(),
    phone: is.String().required(),
    created_at: is.Date().required()
};

class Contacts extends Database.model("contacts") {
    constructor() {
        super();
        this.useSchema(ContactSchema);
    }
}

const UserSchema = {
    type: is.String().required(),
    email: is.String().required(),
    first_name: is.String().required(),
    last_name: is.String().required(),
    verified: is.Boolean().required(),
    updated_at: is.Date().required(),
    address: is.String(),
    created_at: is.Date().required()
};

const GuestSchema = {
    code: is.Uuid().isOptional(),
    type: is.String().required(),
    first_name: is.String().required(),
    last_name: is.String(),
    contact: is.Object(() => ({
        addy: 'Astro World',
        number: '0816762374'
    })).required(),
    guestId: is.Types([
        is.Number(),
        is.Array(),
    ]).default(() => ['en']).required(),
    // guestId: is.ObjectId().required(),
    updated_at: is.Date().required()
};


class Users extends Database.model("users") {

    static schema = GuestSchema;
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

RefreshDateOnUpdate(Users, 'updated_at')


/**
 * @type {typeof Users | typeof XMongoModel}
 */
exports.Users = Users;
/**
 * @type {typeof Contacts | typeof XMongoModel}
 */
exports.Contacts = Contacts;
