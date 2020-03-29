const connection = require('./connection');
const Chance = require('chance');
const chance = new Chance();

async function run() {
    await connection();
    const {Users, Contacts} = require('./models');

    /**
     * Async Space
     */


        const guest = new Users().set({
            type: 'guest',
            first_name: 'Hello',
            last_name: 'World',
            guestId: Users.id('5e5acba088ebeef8a715ca43')
        });

        // console.log(guest.data);
        console.log(guest.validate());


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