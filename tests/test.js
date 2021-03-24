const { connector, connection } = require("./connection");

async function run() {
    await connector();

    const { Users, Contacts } = require("./models");

    // // 5f8bb34c17793a7bb278d24f
    // const user = await Users.findById('5e5acba088ebeef8a715ca43', {
    //     // projection: {_id: 0}
    // });
    //
    //
    // // user.set('contact.date', new Date());
    //
    // console.log(await user.save());

    const guest = Users.use({
        code: "yes",
        // type: "guest",
        first_name: "Hello",
        last_name: "World",
        guestId: "678",
        updated_at: "Fri, 03 Apr 2020 00:00:00 GMT"
    });

    console.log(guest.validate());

    /**
     * End Async Space
     */
}

run()
    .catch(console.error)
    .finally(() => {
        connection.client.close().catch(console.error);
    });
