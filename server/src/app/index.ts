import * as compress from "koa-compress";
import * as koaBody from "koa-body";
import * as cors from "@koa/cors";
import configs from "@configs";

import { ServicesContext } from "./context";
import { appRoutes } from "./routes";
import { Server } from "./server";
import { ChatService, GroupChatService, GroupService, UserService, AdsService } from "./services";

const corsArgs = configs.production ? { origin: "https://production_link" } : {};

export const App = Server.init(app => {
  app
    .use(compress())
    .use(cors(corsArgs))
    .use(koaBody({ multipart: true }))
    .use(appRoutes.routes())
    .use(appRoutes.allowedMethods());
})
  .createServer()
  .createConnection()
  .then(() => {
    ServicesContext.getInstance()
      .setUserService(new UserService())
      .setGroupService(new GroupService())
      .setChatService(new ChatService())
      .setGroupChatService(new GroupChatService())
      .setAdsService(new AdsService());

    Server.run(configs.port);
  });
