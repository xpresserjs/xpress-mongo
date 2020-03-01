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

    const contact = await Contacts.new({
            user_id: '5e5acba088ebeef8a715ca43',
            first_name: null
        });

    console.log(contact.changes());


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