import * as crypto from "crypto-js";
import configs from "@configs";

export function encrypt(data) {
    return crypto.AES.encrypt(data, configs.crypto_key).toString();
}

export function decrypt(message) {
    const bytes = crypto.AES.decrypt(message, configs.crypto_key);
    return bytes.toString(crypto.enc.Utf8);
}