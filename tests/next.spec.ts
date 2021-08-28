import test from "japa";
import User, { mockUser } from "./models/User";
import Connector from "./connection";
import Songs = require("./models/Songs");

test.group("Test xpresser@next functions", async (group) => {
    group.before(async () => {
        let connection = await Connector();
        connection.link(User, "users");
        connection.link(Songs, "songs");

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
});
