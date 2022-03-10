import { is, joi, XMongoDataType } from "../../index";
import { XMongoSchema, XMongoStrictConfig } from "../../src/CustomTypes";
import XMongoTypedModel from "../../src/XMongoTypedModel";
import { randomInt } from "crypto";

export interface UserDataType {
    uuid: string;
    username: string;
    email: string;
    age: number;
    balance: number;
    firstName: string;
    lastName: string;
    updatedAt: Date;
    createdAt: Date;
}

class User extends XMongoTypedModel<UserDataType> {
    static collectionName = "users";

    static strict: XMongoStrictConfig = true;
    // Schema
    static schema: XMongoSchema<UserDataType> = {
        uuid: is.Uuid().required(),
        username: joi.string().required().lowercase().alphanum(),
        email: new XMongoDataType("email")
            .joi(joi.string().required().lowercase().email())
            .unique(),
        age: is.Number(() => randomInt(18, 80)).required(),
        balance: is.Number(() => randomInt(10000, 80000)).required(),
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
