import * as compress from "koa-compress";
import * as koaBody from "koa-body";
import * as cors from "@koa/cors";
import * as jwt from "koa-jwt";
import configs from "@configs";

import { ServicesContext, RainContext, CMCContext, DailyContext } from "./context";
import { appRoutes, apiRoutes, authRoutes } from "./routes";
import { Server } from "./server";
import {
  ChatService,
  GroupChatService,
  GroupService,
  UserService,
  BanService,
  AdsService,
  TransactionService,
  InnerTransactionService
} from "./services";

const corsArgs = configs.production ? { origin: "https://production_link" } : {};

export const App = Server.init(app => {
  app
    .use(compress())
    .use(cors(corsArgs))
    .use(koaBody({ multipart: true }))
    .use(authRoutes.routes())
    .use(jwt({
      secret: configs.token.jwt_secret,
    }))
    .use(appRoutes.routes())
    .use(apiRoutes.routes())
    .use(appRoutes.allowedMethods());
})
  .createServer()
  .createConnection()
  .then(() => {
    ServicesContext.getInstance()
      .setUserService(new UserService())
      .setBanService(new BanService())
      .setGroupService(new GroupService())
      .setChatService(new ChatService())
      .setGroupChatService(new GroupChatService())
      .setAdsService(new AdsService())
      .setTransactionService(new TransactionService())
      .setInnerTransactionService(new InnerTransactionService());
    RainContext.getInstance();
    DailyContext.getInstance();
    CMCContext.getInstance();
    Server.run(configs.port);
  });
