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


    const user = await Users.findOne({}, {projection: {_id: 1}});

    await user.hasOne('contact', {as: 'person'});

    console.log(user);

    /**
     * End Async Space
     */
}

run().then(() => {
    process.exit();
});