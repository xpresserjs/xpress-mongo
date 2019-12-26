const {Users, Contacts} = require('./models');
const Chance = require('chance');
const chance = new Chance();


async function run() {
    /**
     * Async Space
     */

    /*const users = await User.raw.find({}, {}, true).limit(3).each((err, user) => {
        console.log(user);
    });*/

    // Users.


    const user = await Users.new({
        email: chance.email(),
        first_name: chance.first(),
        last_name: chance.last()
    });

    console.log(user);

    /**
     * End Async Space
     */
}

run().then(() => {
    process.exit();
});
