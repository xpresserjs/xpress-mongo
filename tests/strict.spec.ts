import test from "japa";
import User, { mockUser } from "./models/User";
import Connector from "./connection";
import Songs = require("./models/Songs");

test.group("Strict", async (group) => {
    group.before(async () => {
        let connection = await Connector();
        connection.link(User, "users");
        connection.link(Songs, "songs");
    });

    // console.log()
    test.failing("Should fail when adding unknown field", () => {
        const user = mockUser().set("dummy", "hello");
        return user.validate() as any;
    });

    test("Should pass if strict: {removeNonSchemaFields:true}", (assert) => {
        User.strict = { removeNonSchemaFields: true };

        const user = mockUser().set("dummy", "hello");
        const validated = user.validate();

        assert.isUndefined(validated.dummy);
    });

    test.failing("Should fallback to strict if strict is {removeNonSchemaFields:false}", () => {
        User.strict = { removeNonSchemaFields: false };

        const user = mockUser().set("dummy", "hello");

        return user.validate() as any;
    });
});
