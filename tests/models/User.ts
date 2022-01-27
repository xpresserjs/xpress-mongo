import { is, joi, XMongoDataType } from "../../index";
import { XMongoSchema, XMongoStrictConfig } from "../../src/CustomTypes";
import XMongoTypedModel from "../../src/XMongoTypedModel";

interface UserDataType {
    uuid: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    updatedAt: string;
    createdAt: string;
}

class User extends XMongoTypedModel<UserDataType> {
    static strict: XMongoStrictConfig = true;
    // Schema
    static schema: XMongoSchema<UserDataType> = {
        uuid: is.Uuid().required(),
        username: joi.string().required().lowercase().alphanum(),
        email: new XMongoDataType("email")
            .joi(joi.string().required().lowercase().email())
            .unique(),
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

export function mockUser() {
    return new User().set({
        username: "username",
        email: "username@email.com",
        firstName: "User",
        lastName: "Name"
    });
}

export function deleteMockUser(user?: User) {
    return User.native().deleteOne({ username: user ? user.data.username : "username" });
}
