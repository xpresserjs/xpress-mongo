const {Users} = require('./models');
const Chance = require('chance');
const chance = new Chance();

async function run() {
    /**
     * Async Space
     */

    const guest = new Users().useSchema('GuestSchema').set({
        type: 'guest',
        first_name: 'Hello',
        last_name: 'World',
        guestId: chance.guid()
    });

    // const user = new Users().useSchema('UserSchema').set({
    //     email: chance.email()
    // });


    console.log(guest.validate());
    // await user.save();
    // console.log(guest.schema);
    // console.log("Guest:", guest.validate());
    // console.log("User:", user);


    /**
     * End Async Space
     */
}

run().then(() => {
    process.exit();
}).catch(e => {
    console.log(e);
    process.exit();
});