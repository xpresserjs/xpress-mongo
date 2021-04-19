import { is, XMongoModel } from "../../index";
import { sleep } from "../functions";

class Songs extends XMongoModel {
    static schema = {
        userId: is.ObjectId().required(),
        name: is.String().required(),
        size: is.Number().required(),
        saved: is.Boolean().required(),
        createdAt: is.Date()
    };
}

Songs.on("created", (song) => {
    // await sleep();
    console.log("Slug Created:", song.data.name);
});

Songs.on("watch.slug", (song) => {
    // await sleep();
    console.log("Fetched Song:", song);
});

Songs.on("deleted", (song) => {
    // await sleep();
    console.log("Slug Delete:", song);
});

export = Songs;
