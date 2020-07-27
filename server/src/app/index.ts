import * as compress from "koa-compress";
import * as koaStatic from "koa-static";
import * as koaBody from "koa-body";
import * as cors from "@koa/cors";
import * as jwt from "koa-jwt";

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
  InnerTransactionService,
  OtpService,
  ExpenseService,
  ExpenseConfirmService,
  WithdrawAddressService,
  SettingService,
} from "./services";

export const App = Server.init(app => {
  app
    .use(koaStatic("./public"))
    .use(compress())
    .use(cors({}))
    .use(koaBody({ multipart: true }))
    .use(authRoutes.routes())
    .use(jwt({
      secret: process.env.JWT_SECRET,
    }))
    .use(appRoutes.routes())
    .use(apiRoutes.routes())
    .use(appRoutes.allowedMethods());
})
  .createServer()
  .createConnection()
  .then(() => {
    ServicesContext.getInstance()
      .setSettingService(new SettingService())
      .setUserService(new UserService())
      .setBanService(new BanService())
      .setGroupService(new GroupService())
      .setChatService(new ChatService())
      .setGroupChatService(new GroupChatService())
      .setAdsService(new AdsService())
      .setOtpService(new OtpService())
      .setExpenseService(new ExpenseService())
      .setExpenseConfirmService(new ExpenseConfirmService())
      .setWithdrawAddressService(new WithdrawAddressService())
      .setTransactionService(new TransactionService())
      .setInnerTransactionService(new InnerTransactionService());
    RainContext.getInstance();
    DailyContext.getInstance();
    CMCContext.getInstance();
    Server.run(process.env.PORT);
  });
