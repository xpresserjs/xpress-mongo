import { is, joi, XMongoModel } from "../../index";

class Songs extends XMongoModel {
    /**
     * Enable Strict Schema
     */
    static strict = { removeNonSchemaFields: true };
    // static strict = true;
    /**
     * Model Schema
     */
    static schema = {
        name: joi.string().min(3).default("John Doe").required(),
        social: joi
            .object({
                email: joi.string().required().label("social.email")
            })
            .default({ email: "hss" })
            .required(),
        size: is.Number().required(),
        saved: is.Boolean().required(),
        createdAt: is.Date().required()
    };

    data!: { username: string };
}

export = Songs;
