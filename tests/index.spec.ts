import test from "japa";
import Connector from "./connection";
import XMongoClient from "../src/XMongoClient";
import Songs from "./models/Songs";
import Joi from "joi";
import User from "./models/User";

/**
 * Set State using object collection;
 */
let connection: XMongoClient;

test.group("Initialize DB", (group) => {
    group.before(async () => {
        connection = await Connector();
    })

    test("models without class", (assert) => {
        const songs = connection.model("songs")

        // check that class name is Songs
        assert.equal(songs.name, "Songs")

    })

    test("Link models to collections", async () => {
        // Link Models To Database
        connection.link(User, "users");
        connection.link(Songs, "songs");
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
        user = User.make();

        // Check if model generated the expected data from schema
        Joi.attempt(
            user.data,
            // Schema
            Joi.object({
                // .allow(null) is used because there is no ObjectId yet
                _id: Joi.object().allow(null),
                uuid: Joi.string().required(),
                email: Joi.string(),
                age: Joi.number(),
                balance: Joi.number(),
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

    test("User exists", async (assert) => {
        const exists = await User.exists({ username: "johndoe" });

        assert.isNotFalse(exists);
    });

    test("User count must be 1", async (assert) => {
        const count = await User.count({ username: "johndoe" });

        assert.isNotFalse(count === 1);
    });

    test("Fetch user from db", async (assert) => {
        user = (await User.findOne({ username: "johndoe" }))!;

        // Throw error if null.
        assert.isNotNull(user);

        //Check Data returned
        validateUserData(user);
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

test.group("Find Many", () => {
    test("Fetch", async ({ isArray }) => {
        const results = User.fromArray(await User.find({}));
        isArray(results);

        validateUserData((results as any[])[0]);
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

    test("Confirm Delete", async () => {
        const user = await User.findOne({ username: "paulsmith2" });
        // Throw error if user exists
        if (user) throw Error("paulsmith2 still exists in database!");
    });
});

function validateUserData(user: User) {
    Joi.attempt(
        // Pick only modified data
        user.data || {},

        // Schema
        Joi.object({
            _id: Joi.object(),
            uuid: Joi.string().required(),
            email: Joi.string().required().email(),
            age: Joi.number().required(),
            balance: Joi.number().required(),
            username: Joi.string().required(),
            firstName: Joi.string().required(),
            lastName: Joi.string().required(),
            updatedAt: Joi.date().less("now"),
            createdAt: Joi.date().less("now")
        })
    );
}

// });
