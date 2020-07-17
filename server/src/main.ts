import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config();

// App Config
process.env.EMAIL_PATH = path.join(__dirname, "/public/emails");

export { App } from "./app";