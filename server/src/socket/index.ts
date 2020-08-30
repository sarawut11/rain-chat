import * as dotenv from "dotenv";
dotenv.config();

import * as http from "http";
import { socketServer } from "./socket/index";

const server = http.createServer();
socketServer.initServer(server);

server.listen(3030, () => {
  console.log("Listening socket server on *:3030");
});