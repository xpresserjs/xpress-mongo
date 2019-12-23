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


    const user = await Users.findOne();

    await user.hasOneRaw('contact', {cast: true});

    console.log(user.toJson());

    /**
     * End Async Space
     */
}

run().then(() => {
    process.exit();
});