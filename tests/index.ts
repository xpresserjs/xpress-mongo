import Connector from "./connection";
import User from "./models/User";
import Songs from "./models/Songs";
import XMongoTypedModel = require("../src/XMongoTypedModel");
import { omitIdAndPick } from "../index";

const Chance = require("chance");
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

    const songs = await Songs.find({}, { projection: omitIdAndPick(["name"]) });

    Songs.fromArray(songs);

    console.log(songs);
}

Main().catch(console.error);

// class TV extends XMongoTypedModel<{
//     volume: number;
//     channel: number;
//     channelName: string;
// }> {
//     // public data!: Data;
//     // public set!: (key: keyof Data, value?: any) => this;
//
//     getData() {
//         return this.data;
//     }
// }
//
// // class Bar extends Foo {}
//
// const tv = new TV();
// tv.set("channelNamed");

// tv.set("volume")
