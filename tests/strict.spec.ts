import test from "japa";
import User, {deleteMockUser, mockUser} from "./models/User";
import Connector from "./connection";

test.group("Strict", async (group) => {
    group.before(async () => {
        let connection = await Connector();
        connection.link(User, "users");
    });

    group.after(async () => {
        // await deleteMockUser();
    });

    test.failing("Insert: Should fail when adding unknown field", () => {
        const user = mockUser().set("dummy", "hello");
        return user.validate() as any;
    });

    test("Insert: Should pass if strict: {removeNonSchemaFields:true}", (assert) => {
        User.strict = { removeNonSchemaFields: true };

        const user = mockUser().set("dummy", "hello");
        const validated = user.validate();

        assert.isUndefined(validated.dummy);
    });

    test.failing(
        "Insert: Should fallback to strict:true if strict is {removeNonSchemaFields:false}",
        () => {
            User.strict = { removeNonSchemaFields: false };

            const user = mockUser().set("dummy", "hello");

            return user.validate() as any;
        }
    );

    test.failing("Update: Should fail when updating unknown field", async () => {
        // Delete any previously created user
        await deleteMockUser();

        // Set Strict to true
        User.strict = true;

        // Create new user
        const user = await mockUser().saveAndReturn();

        // Updated data
        const data = { dummy: "hello" };

        // Try updating user
        await user.update(data);
    });

    test("Update: Should pass if strict: {removeNonSchemaFields:true}", async (assert) => {
        User.strict = { removeNonSchemaFields: true };

        let user = (await User.findOne({ username: "username" }))!;

        // Updated data
        const data = { dummy: "hello", dummy2: "hi" };

        // Try updating user
        await user.update(data);

        user = (await User.findOne({ username: "username" }))!;

        // Assert that dummy is undefined
        assert.isUndefined(user.get("dummy"));
        assert.isUndefined(user.get("dummy2"));
    });

    test.failing(
        "Update: Should fallback to strict:true if strict is {removeNonSchemaFields:false}",
        async () => {
            User.strict = { removeNonSchemaFields: false };

            const user = (await User.findOne({ username: "username" }))!;

            // Updated data
            const data = { dummy: "hello", dummy2: "hi" };

            // Try updating user
            await user.update(data);
        }
    );
});
