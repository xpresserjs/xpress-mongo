import { is, XMongoModel } from "../../index";

class Songs extends XMongoModel {
    static schema = {
        userId: is.ObjectId().required(),
        name: is.String().required(),
        size: is.Number().required(),
        saved: is.Boolean().required(),
        createdAt: is.Date()
    };
}

Songs.on("create", (song) => {
    console.log("Song Added:", song);
});

export = Songs;
