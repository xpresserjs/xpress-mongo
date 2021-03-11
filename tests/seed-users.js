const { Users } = require("./models");
const Chance = require("chance");
const chance = new Chance();

async function run() {
    /**
     * Async Space
     */

    await Users.raw.deleteMany({});

    let i = 0;
    let amount = Number(process.argv[2] | 0);
    console.time("Total Time");

    while (i < amount) {
        const user = new Users();

        user.set({
            email: chance.email(),
            first_name: chance.first(),
            last_name: chance.last()
        });

        await user.save();

        // console.log(`Users (${user.fullName()}) created!`);

        i++;
    }

    console.timeLog("Total Time");

    /**
     * End Async Space
     */
}

run().then(() => {
    process.exit();
});
