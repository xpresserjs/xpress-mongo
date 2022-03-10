import Connector from "./connection";
import User from "./models/User";
import Songs from "./models/Songs";

// import Chance from "chance";

// const chance = new Chance();

async function Main() {
    const connection = await Connector();

    // Link "users" collection to User model
    connection.link(User, "users");
    // Link "songs" collection to Songs model
    connection.link(Songs, "songs");

    /**
     * Playground for dev test.
     */

    await User.native().deleteMany({});

    const data = [
        {
            username: "John",
            email: "hello@good.com",
            firstName: "John",
            lastName: "Smith",
            age: 40
        },
        {
            username: "Jane",
            email: "jane@good.com",
            firstName: "Jane",
            lastName: "Smith",
            age: 30
        }
    ];

    const makeMany = User.makeManyData(data, {
        intercept: (user) => (user.data.age > 30 ? false : user)
    });

    console.log(makeMany);
}

Main().catch(console.error);
