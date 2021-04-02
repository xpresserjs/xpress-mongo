import { is, XMongoModel } from "../../index";

class Users extends XMongoModel {
    static schema = {
        firstName: is.String().required(),
        lastName: is.String().required(),
        createdAt: is.Date().required()
    };

    // static events = {};

    /**
     * Returns the full name of the user.
     * @return {string}
     */
    fullName() {
        return this.data.firstName + " " + this.data.lastName;
    }
}

Users.on("update", (user) => {
    // console.log("Supposed User:", user);
    console.log("Wrong update function called!");
});

Users.on("delete", (user) => {
    // console.log("Supposed User:", user);
    console.log("Wrong delete function called!");
});

export = Users;
