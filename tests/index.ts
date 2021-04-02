import Connector from "./connection";
import Users from "./models/Users";
import Songs from "./models/Songs";

const Chance = require("chance");
const chance = new Chance();

async function Main() {
    const connection = await Connector();

    // Link "users" collection to Users model
    connection.model("users", Users);
    // Link "songs" collection to Songs model
    connection.model("songs", Songs);

    // Find one user in users collection
    let usersCount = await Users.count({});

    // If user is found
    if (!usersCount) return console.log(`No user found!`);

    // console.log("Users Count:", usersCount);

    const user = (await Users.findOne({}))!;
    // const song = Songs.make({ userId: user.id(), name: chance.animal() });

    // await song.save();
    const song = await Songs.findOne({});
    //
    console.log(song);
    // if (song) await song.delete();
    // console.log(song);
}

Main().catch(console.error);
