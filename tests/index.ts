import Connector from "./connection";
import User from "./models/User";
import Songs from "./models/Songs";
import XMongoModelTyped = require("../src/XMongoTypedModel");

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

    const song = new Songs();
    song.set("hello", "hi");
    console.log(song.validate());
}

Main().catch(console.error);

class TV extends XMongoModelTyped<{
    volume: number;
    channel: number;
    channelName: string;
}> {
    // public data!: Data;
    // public set!: (key: keyof Data, value?: any) => this;

    getData() {
        return this.data;
    }
}

// class Bar extends Foo {}

const tv = new TV();
tv.set("volume");

// tv.set("volume")
