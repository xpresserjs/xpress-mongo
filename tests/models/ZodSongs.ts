import { is, XMongoModel, XMongoDataType } from "../../index";
import { z } from "zod";

class ZodSongs extends XMongoModel {
    static collectionName = "zod_songs";
    /**
     * Enable Strict Schema
     */
    static strict = true;
    /**
     * Model Schema
     */
    static schema = {
        name: z.string().min(3).default("John Doe"),
        social: z
            .object({
                email: z.string()
            })
            .default({ email: "hss" }),
        size: is.Number().required(),
        saved: is.Boolean().required(),
        createdAt: is.Date().required()
    };

    data!: { username: string };
}

export default ZodSongs;
