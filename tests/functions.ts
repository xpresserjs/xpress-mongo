import Connector from "./connection";

export function randomString(length: number = 10): string {
    const result = [];
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join("");
}

export function sleep(ms: number = 2000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectToDb() {
    /**
     * Set State using object collection;
     */
    let connection = await Connector();
}
