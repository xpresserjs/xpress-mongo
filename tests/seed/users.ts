import User, { UserDataType } from "../models/User";

export async function SeedUsers(count: number = 1, deleteExisting: boolean = false) {
    const Chance = require("chance");
    const chance = new Chance();

    /**
     * Async Space
     */
    if (deleteExisting) await User.native().deleteMany({});

    let i = 0;
    let amount = Number(count);

    const insert: UserDataType[] = [];

    while (i < amount) {
        const user = new User();
        const email = chance.email();
        const username = email.split("@")[0];

        user.setMany(<UserDataType>{
            username,
            email,
            firstName: chance.first(),
            lastName: chance.last()
        });

        try {
            insert.push(user.validate() as UserDataType);
            i++;
        } catch (e) {}
    }

    await User.native().insertMany(insert);
}
