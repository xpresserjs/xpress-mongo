import { is, joi, XMongoModel } from "../../index";
import { XMongoSchema } from "../../src/CustomTypes";
import XMongoTypedModel = require("../../src/XMongoTypedModel");

interface UserDataType {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    updatedAt: string;
    createdAt: string;
}

class User extends XMongoTypedModel<UserDataType> {
    // Schema
    static schema: XMongoSchema<UserDataType> = {
        username: joi.string().required().lowercase().alphanum(),
        email: joi.string().required().lowercase().email(),
        firstName: is.String().required(),
        lastName: is.String().required(),
        updatedAt: is.Date().required(),
        createdAt: is.Date().required()
    };

    /**
     * Returns the full name of the user.
     * @return {string}
     */
    fullName() {
        return this.data.firstName + " " + this.data.lastName;
    }
}

export default User;
