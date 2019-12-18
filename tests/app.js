const User = require("./models");

const user = new User().set({
    first_name: 'John',
    last_name: 'Doe'
});


console.log(user.get('created_at'));