import * as dotenv from "dotenv";
dotenv.config();

import * as http from "http";
import { socketServer } from "./socket/index";

let port = 3030;
const portArgIndex = process.argv.indexOf("--port");
try {
  port = Number(process.argv[portArgIndex + 1]);
} catch (error) {
  console.log("Error parsing port args");
}

const server = http.createServer();
socketServer.initServer(server);

server.listen(port, () => {
  console.log(`Listening socket server on *:${port}`);
});