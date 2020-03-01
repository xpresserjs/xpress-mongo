const {Users, Contacts} = require('./models');
const Chance = require('chance');
const chance = new Chance();

async function run() {
    /**
     * Async Space
     */

        // const guest = new Users().useSchema('UserS').set({
        //     type: 'guest',
        //     first_name: 'Hello',
        //     last_name: 'World',
        //     guestId: chance.guid()
        // });

        // const contact = await Contacts.findById('5e5b92f6d7fd524b7ce4fade');
        //
        // contact.set('job', 39);
        // console.log(await contact.save());


        // console.log(guest.data);
        // const user = new Users().useSchema('UserSchema').set({
        //     email: chance.email()
        // });

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