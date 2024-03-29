import test from "japa";
import Connector from "./connection";
import User, { UserDataType } from "./models/User";
import { SeedUsers } from "./seed/users";
import _ from "object-collection/lodash";

const manyUsers = [
    { username: "John", age: 20, balance: 100 },
    { username: "Jane", age: 30, balance: 200 },
    { username: "Joe", age: 40, balance: 300 }
];

test.group("Static Methods", (group) => {
    group.before(async () => {
        let connection = await Connector();
        connection.link(User, "users");

        await SeedUsers(10, true);
    });

    group.after(async () => {
        await User.native().deleteMany({});
    });

    // Test Count
    test("count():", async (assert) => {
        let count = await User.count();
        assert.equal(count, 10);

        // Add 2 more users
        await SeedUsers(2);

        // Re-count && Re-check
        count = await User.count();
        assert.equal(count, 12);
    });

    test("count(): With Query", async (assert) => {
        // shorthand
        let count = await User.count({ age: { $gt: 20 } });

        // long-hand
        const users = await User.find();

        // filter
        const filtered = users.filter((user) => user.age > 20);

        assert.equal(count, filtered.length);
    });

    test("countEstimated():", async (assert) => {
        // shorthand
        let count = await User.countEstimated();

        // long-hand
        const users = await User.find();

        assert.equal(count, users.length);
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

    test("all():", async (assert) => {
        const options = { projection: { email: 1 } };

        // shorthand
        const users = await User.all(options);

        // long-hand
        const users2 = await User.find({}, options);

        assert.equal(users.length, users2.length);
    });

    test("first():", async (assert) => {
        // shorthand
        const short = await User.first();

        // long-hand
        const long = await User.findOne({}, { sort: { _id: 1 } });

        // check if the same
        assert.deepEqual(short, long);
    });

    test("first(): with filter", async (assert) => {
        // shorthand
        const short = await User.first({ filter: { age: { $lte: 35 } } });

        // long-hand
        const long = await User.findOne({ age: { $lte: 35 } }, { sort: { _id: 1 } });

        // check if the same
        assert.deepEqual(short, long);
    });

    test("first(): with sortBy", async (assert) => {
        // shorthand
        let short = await User.first({ sortBy: "age" });

        // long-hand
        let long = await User.findOne({}, { sort: { age: 1 } });

        // check if the same
        assert.deepEqual(short, long);

        // multiple sortBy
        short = await User.first({ sortBy: ["createdAt", "balance"] });

        long = await User.findOne({}, { sort: { createdAt: 1, balance: 1 } });

        assert.deepEqual(short, long);

        // add another sort filter
        short = await User.first({
            sortBy: "age",
            options: { sort: { balance: 1 } }
        });

        long = await User.findOne({}, { sort: { age: 1, balance: 1 } });

        assert.deepEqual(short, long);
    });

    test("last():", async (assert) => {
        // shorthand
        const short = await User.last();

        // long-hand
        const long = await User.findOne({}, { sort: { _id: -1 } });

        // check if the same
        assert.deepEqual(short, long);
    });

    test("last(): with filter", async (assert) => {
        // shorthand
        const short = await User.last({ filter: { age: { $lte: 35 } } });

        // long-hand
        const long = await User.findOne({ age: { $lte: 35 } }, { sort: { _id: -1 } });

        // check if the same
        assert.deepEqual(short, long);
    });

    test("last(): with sortBy", async (assert) => {
        // shorthand
        let short = await User.last({ sortBy: "age" });

        // long-hand
        let long = await User.findOne({}, { sort: { age: -1 } });

        // check if the same
        assert.deepEqual(short, long);

        // multiple sortBy
        short = await User.last({ sortBy: ["createdAt", "balance"] });

        long = await User.findOne({}, { sort: { createdAt: -1, balance: -1 } });

        assert.deepEqual(short, long);

        // add another sort filter
        short = await User.last({
            sortBy: "age",
            options: { sort: { balance: -1 } }
        });

        long = await User.findOne({}, { sort: { age: -1, balance: -1 } });

        assert.deepEqual(short, long);
    });

    test("last(): with options", async (assert) => {
        // shorthand
        const short = await User.last({
            options: { projection: { email: 1, age: 1 } }
        });

        // long-hand
        const long = await User.findOne(
            {},
            { sort: { _id: -1 }, projection: { email: 1, age: 1 } }
        );

        // check if the same
        assert.deepEqual(short, long);
    });

    test("makeMany():", async (assert) => {
        const users = User.makeMany(manyUsers);

        assert.equal(users.length, 3);

        // check that all items are instances of User
        users.forEach((user) => {
            assert.isTrue(user instanceof User);

            // check that all items have auto generated properties
            // i.e. uuid, createdAt
            assert.isString(user.data.uuid);
            assert.isTrue(user.data.createdAt instanceof Date);
        });
    });

    test("makeMany(): with interceptor", async (assert) => {
        let users = User.makeMany(manyUsers, {
            interceptor: (user) => {
                user.data.username = "New Name";
                return user;
            }
        });

        // check that all items have same username
        assert.isTrue(users.every((user) => user.data.username === "New Name"));

        // Check that returning false will not add the user to the collection
        users = User.makeMany(manyUsers, {
            interceptor: (user) => {
                // if the username is "Joe" then return false to exclude it.
                return user.data.username === "Joe" ? false : user;
            }
        });

        assert.equal(users.length, 2);

        // check that user with username "Joe" is not included
        assert.isFalse(users.some((user) => user.data.username === "Joe"));
    });

    test("makeManyData():", async (assert) => {
        let users = User.makeManyData<UserDataType>(manyUsers);

        assert.equal(users.length, 3);

        users.forEach((user) => {
            // Should not be an instance of User
            assert.isFalse(user instanceof User);

            // check that all items have auto generated properties
            // i.e. uuid, createdAt
            assert.isString(user.uuid);
            assert.isTrue(user.createdAt instanceof Date);
        });
    });

    test.failing("makeManyData(): Test with validation", () => {
        User.makeManyData<UserDataType>(manyUsers, { validate: true });
    });

    test("makeManyData(): Test with validation but skip errors", () => {
        User.makeManyData<UserDataType>(manyUsers, {
            validate: true,
            stopOnError: false
        });
    });

    test("makeManyData(): with interceptor", async (assert) => {
        let users = User.makeManyData<UserDataType>(manyUsers, {
            interceptor: (user) => {
                user.data.username = "New Name";
                return user;
            }
        });

        // check that all items have same username
        assert.isTrue(users.every((user) => user.username === "New Name"));

        // Check that returning false will not add the user to the collection
        users = User.makeManyData<UserDataType>(manyUsers, {
            interceptor: (user) => {
                // if the username is "Joe" then return false to exclude it.
                return user.data.username === "Joe" ? false : user;
            }
        });

        assert.equal(users.length, 2);

        // check that user with username "Joe" is not included
        assert.isFalse(users.some((user) => user.username === "Joe"));
    });

    test("paginate():", async (assert) => {
        await SeedUsers(20, true);

        const page = 1,
            perPage = 5;

        const users = await User.paginate(page, perPage);

        assert.equal(users.total, 20);
        assert.equal(users.perPage, perPage);
        assert.equal(users.page, page);
        assert.equal(users.lastPage, 4);
        assert.equal(users.data.length, perPage);
    });

    test("paginateAggregate():", async (assert) => {
        await SeedUsers(20, true);

        const page = 1,
            perPage = 5;

        const users = await User.paginateAggregate(page, perPage);

        assert.equal(users.total, 20);
        assert.equal(users.perPage, perPage);
        assert.equal(users.page, page);
        assert.equal(users.lastPage, 4);
        assert.equal(users.data.length, perPage);
    });

    test("projectPublicFields(): No Arguments", async (assert) => {
        const projection = User.projectPublicFields();
        const expectedResult = { _id: 0 } as Record<string, 1 | 0>;

        User.publicFields.forEach((field) => {
            expectedResult[field] = 1;
        });

        // will exclude _id and include username, age, balance
        assert.deepEqual(projection, expectedResult);
    });

    test("projectPublicFields(): With Add", async (assert) => {
        const projection = User.projectPublicFields(["email"]);
        const expectedResult = { _id: 0 } as Record<string, 1 | 0>;

        User.publicFields.concat(["email"]).forEach((field) => {
            expectedResult[field] = 1;
        });

        // will exclude _id and include username, age, balance, email
        assert.deepEqual(projection, expectedResult);
    });

    test("projectPublicFields(): With Except", async (assert) => {
        const projection = User.projectPublicFields([], ["username"]);
        const expectedResult = { _id: 0 } as Record<string, 1 | 0>;

        User.publicFields
            .filter((field) => field !== "username")
            .forEach((field) => {
                expectedResult[field] = 1;
            });

        // will exclude _id and include age, balance, ignoring username
        assert.deepEqual(projection, expectedResult);

        // test except helper method
        const projection2 = User.projectPublicFieldsExcept(["username"]);

        assert.deepEqual(projection2, expectedResult);
    });

    test("projectPublicFields(): With Add and Except", async (assert) => {
        const projection = User.projectPublicFields(["email"], ["username"]);
        const expectedResult = { _id: 0 } as Record<string, 1 | 0>;

        User.publicFields
            .concat(["email"])
            .filter((field) => field !== "username")
            .forEach((field) => {
                expectedResult[field] = 1;
            });

        // will exclude _id and include age, balance, email, ignoring username
        assert.deepEqual(projection, expectedResult);
    });

    test("getPublicFields()", async (assert) => {
        const user = await User.first();
        if (!user) throw new Error("User not found");

        const fields = user.getPublicFields();
        const expectedResult = {} as Record<string, 1 | 0>;

        User.publicFields.forEach((field) => {
            expectedResult[field] = user.get(field);
        });

        assert.deepEqual(fields, expectedResult);
    });

    test("getPublicFields(): With Add", async (assert) => {
        const user = await User.first();
        if (!user) throw new Error("User not found");

        const fields = user.getPublicFields(["updatedAt"]);
        const expectedResult = {} as Record<string, any>;

        User.publicFields.concat(["updatedAt"]).forEach((field) => {
            expectedResult[field] = user.get(field);
        });

        assert.deepEqual(fields, expectedResult);
    });

    test("getPublicFields(): With Except", async (assert) => {
        const user = await User.first();
        if (!user) throw new Error("User not found");

        const fields = user.getPublicFields(undefined, ["balance"]);
        const expectedResult = {} as Record<string, any>;

        User.publicFields
            .filter((field) => field !== "balance")
            .forEach((field) => {
                expectedResult[field] = user.get(field);
            });

        assert.deepEqual(fields, expectedResult);
    });

    test("getPublicFields(): With Add and Except", async (assert) => {
        const user = await User.first();
        if (!user) throw new Error("User not found");

        const fields = user.getPublicFields(["updatedAt"], ["balance"]);
        const expectedResult = {} as Record<string, any>;

        User.publicFields
            .concat(["updatedAt"])
            .filter((field) => field !== "balance")
            .forEach((field) => {
                expectedResult[field] = user.get(field);
            });

        assert.deepEqual(fields, expectedResult);
    });

    test("pick()", async (assert) => {
        const user = await User.first();
        if (!user) throw new Error("User not found");

        const fields = user.pick(["username", "age"]);

        assert.deepEqual(fields, {
            username: user.get("username"),
            age: user.get("age")
        });
    });

    test("omit()", async (assert) => {
        const user = await User.first();
        if (!user) throw new Error("User not found");

        const fields = user.omit(["username", "age"]);
        const expectedResult = _.omit(user.data, ["username", "age"]);

        assert.deepEqual(fields, expectedResult);
    });
});
