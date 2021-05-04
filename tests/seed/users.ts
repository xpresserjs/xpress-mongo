import Connector from "../connection";
import User from "../models/User";

async function SeedUsers() {
    const connection = await Connector();
    // Link Model
    connection.model("users", User);

    const Chance = require("chance");
    const chance = new Chance();

    /**
     * Async Space
     */

    await User.native().deleteMany({});

    let i = 0;
    let amount = Number((process.argv[2] as any) || 1);
    console.time("Total Time");

    while (i < amount) {
        const user = new User();

        user.set({
            email: chance.email(),
            firstName: chance.first(),
            lastName: chance.last()
        });

        await user.save();

        // console.log(`User (${user.fullName()}) created!`);

        i++;
    }

    console.timeLog("Total Time");

    /**
     * End Async Space
     */
}

SeedUsers().then(() => {
    process.exit();
});
