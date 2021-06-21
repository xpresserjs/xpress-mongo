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

    // await User.new({
    //     username: "John",
    //     email: "hello@good.com",
    //     firstName: "John",
    //     lastName: "Smith"
    // });

    const song = (await User.findOne({}))!;

    console.log(song);
}

Main().catch(console.error);
