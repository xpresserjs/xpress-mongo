import test from "japa";
import Connector from "./connection";
// import { Obj } from "object-collection/exports";
import XMongoClient = require("../src/XMongoClient");
import User = require("./models/User");
import Songs = require("./models/Songs");
import Joi from "joi";

/**
 * Set State using object collection;
 */
let connection: XMongoClient;

test.group("Initialize DB", () => {
    test(`Connect to database: "xpress-mongo"`, async () => {
        connection = await Connector();
    });

    test("Link models to collections", async () => {
        // Link Models To Database
        connection.model("users", User);
        connection.model("songs", Songs);
    });

    test("Delete all data (native)", async () => {
        await User.native().deleteMany({});
        await Songs.native().deleteMany({});
    });
});

// test.group("CRUD", () => {
test.group("Create User", () => {
    let user: User;

    test("Make Data", () => {
        user = User.make({});

        // Check if model generated the expected data from schema
        Joi.attempt(
            user.data,
            // Schema
            Joi.object({
                // .allow(null) is used because there is no ObjectID yet
                _id: Joi.object().allow(null),
                email: Joi.string(),
                username: Joi.string(),
                firstName: Joi.string(),
                lastName: Joi.string(),
                updatedAt: Joi.date().required(),
                createdAt: Joi.date().required()
            })
        );
    });

    test("Set Data", () => {
        user.set({
            email: "hello",
            username: "johnDoe",
            firstName: "John",
            lastName: "Doe"
        });

        //Check if data set matches data above
        Joi.attempt(
            // Pick only modified data
            user.toCollection().pick(["email", "username", "firstName", "lastName"]),

            // Schema
            Joi.object({
                email: Joi.string().valid("hello"),
                username: Joi.string().required().valid("johnDoe"),
                firstName: Joi.string().required().valid("John"),
                lastName: Joi.string().required().valid("Doe")
            })
        );
    });

    test.failing("Save and expect email error", async () => {
        await user.save();
    });

    test("Fix email", () => {
        user.set("email", "JohnDoe@doe.com");
    });

    test("Save Data", async () => {
        await user.save();
    });
});

test.group("Read/Update User", () => {
    let user: User;

    test("Fetch user from db", async (assert) => {
        user = (await User.findOne({ username: "johndoe" }))!;

        // Throw error if null.
        assert.isNotNull(user);

        //Check Data returned
        Joi.attempt(
            // Pick only modified data
            user.data,

            // Schema
            Joi.object({
                _id: Joi.object(),
                email: Joi.string().required().email(),
                username: Joi.string().required(),
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                updatedAt: Joi.date().less("now"),
                createdAt: Joi.date().less("now")
            })
        );
    });

    test(`Update using ".update()"`, async (assert) => {
        await user.update({ username: "paulsmith" });

        // check if user.data.username was updated
        assert.equal(user.data.username, "paulsmith");

        // Refresh from Database
        await user.$refreshData();

        // recheck database value match
        assert.equal(user.data.username, "paulsmith");
    });

    test(`Update using ".save()"`, async (assert) => {
        await user.set("username", "paulsmith2").save();

        // check if user.data.username was updated
        assert.equal(user.data.username, "paulsmith2");

        // Refresh from Database
        await user.$refreshData();

        // recheck database value match
        assert.equal(user.data.username, "paulsmith2");
    });

    test(`Test Model method ".fullName()"`, (assert) => {
        assert.equal(user.fullName(), `${user.data.firstName} ${user.data.lastName}`);
    });
});

test.group("Delete User", async () => {
    test(`Fetch and Delete`, async (assert) => {
        const user = await User.findOne({ username: "paulsmith2" });
        // Throw error if null.
        assert.isNotNull(user);
        // delete
        await user!.delete();
    });

    test("Confirm Delete", async (assert) => {
        const user = await User.findOne({ username: "paulsmith2" });
        // Throw error if user exists
        if (user) throw Error("paulsmith2 still exists in database!");
    });
});
// });
