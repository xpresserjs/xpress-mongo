import { is, XMongoDataType } from "../../index";
import { XMongoSchema, XMongoStrictConfig } from "../../src/types/index";
import XMongoTypedModel from "../../src/XMongoTypedModel";
import { randomInt } from "crypto";
import { z } from "zod";

export interface ZodUserDataType {
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

class ZodUser extends XMongoTypedModel<ZodUserDataType> {
    static collectionName = "zod_users";

    static strict: XMongoStrictConfig = true;

    static append = ["fullName"];
    // Schema
    static schema: XMongoSchema<ZodUserDataType> = {
        uuid: is.Uuid().required(),
        username: z.string().toLowerCase(),
        email: new XMongoDataType("email")
            .zod(z.string().email().toLowerCase())
            .unique(),
        age: is.Number(() => randomInt(18, 80)).required(),
        balance: is.Number(() => randomInt(10000, 80000)).required(),
        firstName: is.String().required(),
        lastName: is.String().required(),
        updatedAt: is.Date().required(),
        createdAt: is.Date().required()
    };

    static publicFields = ["uuid", "username", "email", "age", "balance", "fullName"];

    /**
     * Returns the full name of the user.
     * @return {string}
     */
    fullName() {
        return this.data.firstName + " " + this.data.lastName;
    }
}

export default ZodUser;

export function mockZodUser() {
    return new ZodUser().setMany({
        username: "zoduser",
        email: "zoduser@email.com",
        firstName: "Zod",
        lastName: "User"
    });
}

export function deleteZodMockUser(user?: ZodUser) {
    return ZodUser.native().deleteOne({ username: user ? user.data.username : "zoduser" });
}
