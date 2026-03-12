import test from "japa";
import Connector from "./connection";
import XMongoClient from "../src/XMongoClient";
import ZodSongs from "./models/ZodSongs";
import ZodUser from "./models/ZodUser";
import { z } from "zod";

/**
 * Set State using object collection;
 */
let connection: XMongoClient;

test.group("Zod: Initialize DB", (group) => {
    group.before(async () => {
        connection = await Connector();
    });

    test("Link models to collections", async () => {
        connection.link(ZodUser, "zod_users");
        connection.link(ZodSongs, "zod_songs");
    });

    test("Delete all data (native)", async () => {
        await ZodUser.native().deleteMany({});
        await ZodSongs.native().deleteMany({});
    });
});

test.group("Zod: Create User", () => {
    let user: ZodUser;

    test("Make Data", () => {
        user = ZodUser.make();

        // Check if model generated the expected data from schema
        const schema = z.object({
            _id: z.any(),
            uuid: z.string(),
            email: z.string().optional(),
            age: z.number(),
            balance: z.number(),
            username: z.string().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            updatedAt: z.date(),
            createdAt: z.date()
        });

        schema.parse(user.data);
    });

    test("Set Data", () => {
        user.setMany({
            email: "hello",
            username: "johnDoe",
            firstName: "John",
            lastName: "Doe"
        });

        const picked = user.toCollection().pick(["email", "username", "firstName", "lastName"]);

        // Validate picked data
        const schema = z.object({
            email: z.literal("hello"),
            username: z.literal("johnDoe"),
            firstName: z.literal("John"),
            lastName: z.literal("Doe")
        });

        schema.parse(picked);
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

test.group("Zod: Read/Update User", () => {
    let user: ZodUser;

    test("User exists", async (assert) => {
        const exists = await ZodUser.exists({ username: "johndoe" });

        assert.isNotFalse(exists);
    });

    test("User count must be 1", async (assert) => {
        const count = await ZodUser.count({ username: "johndoe" });

        assert.isNotFalse(count === 1);
    });

    test("Fetch user from db", async (assert) => {
        user = (await ZodUser.findOne({ username: "johndoe" }))!;

        // Throw error if null.
        assert.isNotNull(user);

        // Validate data
        validateZodUserData(user);

        user.validate();
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

test.group("Zod: Find Many", () => {
    test("Fetch", async ({ isArray }) => {
        const results = ZodUser.fromArray(await ZodUser.find({}));
        isArray(results);

        validateZodUserData((results as any[])[0]);
    });
});

test.group("Zod: Delete User", async () => {
    test(`Fetch and Delete`, async (assert) => {
        const user = await ZodUser.findOne({ username: "paulsmith2" });
        // Throw error if null.
        assert.isNotNull(user);
        // delete
        await user!.delete();
    });

    test("Confirm Delete", async () => {
        const user = await ZodUser.findOne({ username: "paulsmith2" });
        // Throw error if user exists
        if (user) throw Error("paulsmith2 still exists in database!");
    });
});

test.group("Zod: Songs with direct Zod schemas", () => {
    test("Create song with defaults", async (assert) => {
        const song = ZodSongs.make({
            size: 100,
            saved: true
        });

        // Check defaults were applied
        assert.equal((song.data as any).name, "John Doe");
        assert.deepEqual((song.data as any).social, { email: "hss" });
    });

    test.failing("Create song with invalid name (too short)", () => {
        const song = ZodSongs.make({
            name: "ab",
            size: 100,
            saved: true
        });

        return song.validate() as any;
    });

    test("Create and save song", async (assert) => {
        const song = ZodSongs.make({
            name: "Test Song",
            social: { email: "test@example.com" },
            size: 200,
            saved: false
        });

        await song.save();
        assert.isNotNull(song.id());
    });

    test("Fetch song from db", async (assert) => {
        const song = (await ZodSongs.findOne({ name: "Test Song" })) as any;
        assert.isNotNull(song);
        assert.equal(song!.data.name, "Test Song");
        assert.equal(song!.data.size, 200);
    });
});

test.group("Zod: Validation Edge Cases", () => {
    test("Zod schema with XMongoDataType.zod()", (assert) => {
        const { XMongoDataType } = require("../index");

        const dt = new XMongoDataType("test").zod(z.string().email());
        assert.isTrue(dt.schema.isZod);
        assert.isTrue(dt.schema.required);
    });

    test("Zod schema with optional field", (assert) => {
        const { XMongoDataType } = require("../index");

        const dt = new XMongoDataType("test").zod(z.string().optional());
        assert.isTrue(dt.schema.isZod);
        assert.isFalse(dt.schema.required);
    });

    test("Zod schema with default value", (assert) => {
        const { XMongoDataType } = require("../index");

        const dt = new XMongoDataType("test").zod(z.string().default("hello"));
        assert.isTrue(dt.schema.isZod);
        assert.equal(dt.schema.default, "hello");
        assert.isFalse(dt.schema.required);
    });

    test("Zod schema with UseZod function", (assert) => {
        const { XMongoDataType } = require("../index");

        const dt = new XMongoDataType("test").zod((zod: typeof z) =>
            zod.string().min(3).default("abc")
        );
        assert.isTrue(dt.schema.isZod);
        assert.equal(dt.schema.default, "abc");
    });

    test.failing("Zod validation throws on invalid data", () => {
        const { XMongoDataType } = require("../index");

        const dt = new XMongoDataType("test").zod(z.string().email());
        (dt.schema.validator as z.ZodType).parse("not-an-email");
    });

    test("Zod transform is applied during validation", (assert) => {
        const { XMongoDataType } = require("../index");

        const dt = new XMongoDataType("test").zod(z.string().toLowerCase());
        const result = (dt.schema.validator as z.ZodType).parse("HELLO");
        assert.equal(result, "hello");
    });
});

test.group("Zod: Strict Mode", () => {
    test.failing("Insert: Should fail when adding unknown field", () => {
        const user = new ZodUser()
            .setMany({
                username: "zoduser",
                email: "zoduser@email.com",
                firstName: "Zod",
                lastName: "User"
            })
            .set("dummy", "hello");
        return user.validate() as any;
    });

    test("Insert: Should pass if strict: {removeNonSchemaFields:true}", (assert) => {
        ZodUser.strict = { removeNonSchemaFields: true };

        const user = new ZodUser()
            .setMany({
                username: "zoduser",
                email: "zoduser@email.com",
                firstName: "Zod",
                lastName: "User"
            })
            .set("dummy", "hello");
        const validated = user.validate();

        assert.isUndefined(validated.dummy);

        // Reset strict mode
        ZodUser.strict = true;
    });
});

function validateZodUserData(user: ZodUser) {
    z.object({
        _id: z.any(),
        uuid: z.string(),
        email: z.string().email(),
        age: z.number(),
        balance: z.number(),
        username: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        updatedAt: z.date(),
        createdAt: z.date(),
        fullName: z.string().optional()
    }).parse(user.data || {});
}
