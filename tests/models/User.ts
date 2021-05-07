import { is, joi, XMongoModel } from "../../index";

class User extends XMongoModel {
    static schema = {
        username: joi.string().required().lowercase().alphanum(),
        email: joi.string().required().lowercase().email(),
        firstName: is.String().required(),
        lastName: is.String().required(),
        updatedAt: is.Date().required(),
        createdAt: is.Date().required()
    };

    public data!: {
        username: string;
        firstName: string;
        lastName: string;
    };

    // static events = {};

    /**
     * Returns the full name of the user.
     * @return {string}
     */
    fullName() {
        return this.data.firstName + " " + this.data.lastName;
    }
}

export = User;
