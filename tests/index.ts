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

    await User.native().deleteMany({});

    const song = await User.new({
        username: "John",
        email: "hello@good.com",
        firstName: "John",
        lastName: "Smith",
        contact: {
            a: {
                b: {
                    c: "foo"
                },
                d: "dog"
            }
        }
    });

    console.log("1", song.data.contact.a.b.c);
    console.log("2", song.get("contact.a.b.c"));
    //
    // // console.log(song);
    // const song: User | null = await User.native().findOne({});
    //
    // if (!song) throw Error("No Song found");
    //
    // console.log(await song.updateRaw({ email: "hi@good.com" }));
    // // song.validate();
    // // console.log(song.schema["email"]);
    //
    // // await song.set({ firstName: chance.name() }).save();
    // // song.set({ email: chance.name() });
    //
    // // console.log(song.validate());
}

Main().catch(console.error);
