import test from "japa";
import User, { mockUser } from "./models/User";
import Connector from "./connection";

test.group("Test v >=2 functions", async (group) => {
    group.before(async () => {
        let connection = await Connector();
        connection.link(User, "users");

        await User.native().deleteMany({});
    });

    test("Test: generateId", (assert) => {
        const user = mockUser().generateId();

        assert.isNotNull(user.id());
        assert.isObject(user.id());
    });

    test("Create new user with generateId", async (assert) => {
        const user = mockUser().generateId();
        const id = user.id()!;

        await user.save();

        assert.equal(id.toString(), user.id()!.toString());

        await user.delete();
    });

    test("Create new user with useId", async (assert) => {
        const user = mockUser().useId(User.id()!);
        const id = user.id()!.toString();

        await user.save();

        assert.equal(id, user.id()!.toString());

        await user.delete();
    });

    test("Set usingCustomId to false on $refreshData", async (assert) => {
        const user = mockUser().generateId();

        assert.isNotNull(user.id());
        assert.isObject(user.id());

        await user.save();
        await user.$refreshData();

        // Should update instead of insert
        await user.save();

        await user.delete();
    });

    test("Update, Delete & Unset: use findOneQuery if no _id", async (assert) => {
        let user = await mockUser().saveAndReturn();
        user = (await User.findOne({ username: user.data.username }, { projection: { _id: 0 } }))!;

        // Try updating without _id;
        await user.update({
            lastName: "newLastName"
        });

        // Try unsetting without _id;
        await user.unset("lastName");

        // refresh data
        await user.$refreshData();

        // check if lastName has been removed
        assert.isUndefined(user.data.lastName);

        // Try deleting without _id;
        await user.delete();
    });

    test.failing("Update: fail if no _id i.e canTalkToDatabase", async () => {
        const user = mockUser();

        await user.update({
            lastName: "newLastName"
        });
    });

    test.failing("UpdateRaw: fail if no _id i.e canTalkToDatabase", async () => {
        const user = mockUser();

        await user.updateRaw({
            $set: {
                lastName: "newLastName"
            }
        });
    });

    test.failing("Unset: fail if no _id i.e canTalkToDatabase", async () => {
        const user = mockUser();

        await user.unset("lastName");
    });
});
