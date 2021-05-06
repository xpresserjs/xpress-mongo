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

    /**
     * Playground for dev test.
     */
}

Main().catch(console.error);
