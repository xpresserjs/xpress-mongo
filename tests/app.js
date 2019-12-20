const User = require('./models');

(async () => {
    /**
     * Async Space
     */

    /*const user = new User({
        first_name: "Foo",
        email: "something@cash.com"
    });

    console.log(user.save());*/

    const users = await User.find();
    console.log(users);

    /**
     * End Async Space
     */
})();