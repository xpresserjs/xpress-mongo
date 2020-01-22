const {Users, Contacts} = require('./models');
const helpers = require('../fns/projection');
const Chance = require('chance');
const chance = new Chance();


async function run() {
    const data = await Users.toArray(r => r.find());

    console.log(data);
}

run().then(() => {
    // process.exit();
});
