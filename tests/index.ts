import Connector from "./connection";
import User from "./models/User";
import Songs from "./models/Songs";
import XMongoTypedModel = require("../src/XMongoTypedModel");
import { omitIdAndPick } from "../index";
import Chance from "chance";
const chance = new Chance();

async function Main() {
    const connection = await Connector();

    // Link "users" collection to User model
    connection.link(User, "users");
    // Link "songs" collection to Songs model
    connection.link(Songs, "songs");

    /**
     * Playground for dev test.
     */

    // const song = await User.new({
    //     username: "John",
    //     email: "hello@good.com",
    //     firstName: "John",
    //     lastName: "Smith"
    // });
    //
    // console.log(song);
    const song: User | null = await User.native().findOne({});

    if (!song) throw Error("No Song found");

    console.log(await song.updateRaw({ email: "hi@good.com" }));
    // song.validate();
    // console.log(song.schema["email"]);

    // await song.set({ firstName: chance.name() }).save();
    // song.set({ email: chance.name() });

    // console.log(song.validate());
}

Main().catch(console.error);
