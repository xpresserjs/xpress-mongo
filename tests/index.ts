import Connector from "./connection";
import User from "./models/User";
import Songs from "./models/Songs";
import { randomString } from "./functions";

const Chance = require("chance");
const chance = new Chance();

async function Main() {
    const connection = await Connector();

    // Link "users" collection to User model
    connection.model("users", User);
    // Link "songs" collection to Songs model
    connection.model("songs", Songs);

    // Find one user in users collection
    // let usersCount = await User.count({});

    // If user is found
    // if (!usersCount) return console.log(`No user found!`);

    // console.log("User Count:", usersCount);

    const user = (await User.findOne({}))!;
    const song = Songs.make({
        userId: user.id(),
        name: chance.animal(),
        goat: "hello"
        // social: { email: "hs" }
    });

    console.log(song.validate());

    // song.data.goat = "hello";
    // .saveAndReturn();

    // await song.save();

    // const song = await Songs.findOne();
    //
    // await song!.update({ "social.email": chance.animal() });
    //
    // console.log(song);
    // await song!.update({ goat: "hello" });

    // console.log(song.validate(undefined, true));
    // console.log(song.validate());
}

Main().catch(console.error);
