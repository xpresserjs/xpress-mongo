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


    function newUser() {
        const user = new Users().set({
            email: chance.email(),
            first_name: chance.first(),
            last_name: chance.last()
        });

        console.log(user);
    }

    await newUser();
    setInterval(newUser, 5000);

    /**
     * End Async Space
     */
}

run().then(() => {
    // process.exit();
});
