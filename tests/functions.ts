import Connector from "./connection";

/**
 * Generates a random string of length `len`.
 * @param length
 */
export function randomString(length: number = 10): string {
    const result = [];
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join("");
}

/**
 * Sleeps for `ms` milliseconds.
 * @param ms
 */
export function sleep(ms: number = 2000) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Connects to the database and returns a connector.
 */
export async function connectToDb() {
    return await Connector();
}
