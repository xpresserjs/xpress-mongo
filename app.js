const User = require("./models");


const user = new User().set({
    first_name: 'Xam',
    last_name: 'Nmeje'
});


console.log(user.get('created_at'));