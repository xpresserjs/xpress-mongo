const connection = require('./connection');

async function run() {
    await connection();
    const {Users, Contacts} = require('./models');

    const user = await Users.findById('5e5acba088ebeef8a715ca43', {
        projection: {_id: 0}
    });

    console.log(user);

    /**
     * Async Space
     */
    /*const guest = new Users().set({
        type: 'guest',
        first_name: 'Hello',
        last_name: 'World',
        guestId: '678',
        updated_at: 'Fri, 03 Apr 2020 00:00:00 GMT'
    });

    // console.log(guest.data);
    console.log(guest.validate());*/


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