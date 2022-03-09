import test from "japa";
import Connector from "./connection";
import User, { UserDataType } from "./models/User";
import { SeedUsers } from "./seed/users";

test.group("Static Methods", (group) => {
    group.before(async () => {
        let connection = await Connector();
        connection.link(User, "users");

        await SeedUsers(10, true);
    });

    group.after(async () => {
        await User.native().deleteMany({});
    });

    test("sum(): Single Field", async (assert) => {
        // via shorthand
        const sum = await User.sum("age");

        // via long hand
        const users: UserDataType[] = await User.find();
        const sum2 = users.reduce((acc, user) => acc + user.age, 0);

        assert.equal(sum as number, sum2);
    });

    test("sum(): Multiple Fields", async (assert) => {
        // via shorthand
        const sum = await User.sumMany(<const>["age", "balance"]);
        const sum2 = await User.sumMany({ totalAge: "age", totalBalance: "balance" });

        assert.equal(sum.age, sum2.totalAge);
        assert.equal(sum.balance, sum2.totalBalance);

        // via long hand
        const users: UserDataType[] = await User.find();

        const totalAge = users.reduce((acc, user) => acc + user.age, 0);
        const totalBalance = users.reduce((acc, user) => acc + user.balance, 0);

        assert.equal(sum.age, totalAge);
        assert.equal(sum.balance, totalBalance);

        assert.equal(sum2.totalAge, totalAge);
        assert.equal(sum2.totalBalance, totalBalance);
    });
});
