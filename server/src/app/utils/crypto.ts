import * as crypto from "crypto-js";
import configs from "@configs";

export function encrypt(data) {
    return crypto.AES.encrypt(data, configs.cryptoKey).toString();
}

export function decrypt(message) {
    const bytes = crypto.AES.decrypt(message, configs.cryptoKey);
    return bytes.toString(crypto.enc.Utf8);
}