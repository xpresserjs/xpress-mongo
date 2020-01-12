const {Users, Contacts} = require('./models');
const helpers = require('../fns/projection');
const Chance = require('chance');
const chance = new Chance();


async function run() {
    const keys = ['name', 'email'];
    console.log(helpers.pickKeys(keys));
    console.log(helpers.omitKeys(keys));
    console.log(helpers.omitIdAnd(keys));
    console.log(helpers.omitIdAndPick(keys));
}

run().then(() => {
    // process.exit();
});
