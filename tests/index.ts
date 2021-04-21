import Connector from "./connection";
import Users from "./models/Users";
import Songs from "./models/Songs";
import { randomString } from "./functions";

const Chance = require("chance");
const chance = new Chance();

async function Main() {
    const connection = await Connector();

    // Link "users" collection to Users model
    connection.model("users", Users);
    // Link "songs" collection to Songs model
    connection.model("songs", Songs);

    // Find one user in users collection
    // let usersCount = await Users.count({});

    // If user is found
    // if (!usersCount) return console.log(`No user found!`);

    // console.log("Users Count:", usersCount);

    const user = (await Users.findOne({}))!;
    const song = await new Songs()
        .set({ userId: user.id(), name: chance.animal() })
        .saveAndReturn();

    console.log("01.....", song);
    // const song = (await Songs.findOne({}))!;

    // console.log("before watch".toUpperCase());
    await song.update({
        slug: randomString()
    });
    console.log("02.....");

    if (song) await song.delete();
    console.log("03.....");
}

Main().catch(console.error);
