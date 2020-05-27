import * as crypto from "crypto-js";
import configs from "@configs";

const crypto_key = configs.crypto_key;

export function encrypt(data) {
  return crypto.AES.encrypt(data, crypto_key).toString();
}

export function decrypt(message) {
  const bytes = crypto.AES.decrypt(message, crypto_key);
  return bytes.toString(crypto.enc.Utf8);
}