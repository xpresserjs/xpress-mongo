const User = require('./models');
const Chance = require('chance');
const chance = new Chance();

(async () => {
    /**
     * Async Space
     */

    const user = new User();

    user.set({
        email: chance.email(),
        first_name: chance.first(),
        last_name: chance.last()
    });

    console.log(user);

    /**
     * End Async Space
     */
})();