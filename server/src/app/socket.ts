import * as dotenv from "dotenv";
dotenv.config();

import * as http from "http";
import { socketServer } from "./socket/server.socket";
import { ServicesContext } from "@context";
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
  ImpcostService,
  MembershipPriceService,
} from "@services";

let port = 3030;
const portArgIndex = process.argv.indexOf("--port");
try {
  port = Number(process.argv[portArgIndex + 1]);
} catch (error) {
  console.log("Error parsing port args");
}

const server = http.createServer();
ServicesContext.getInstance()
  .setSettingService(new SettingService())
  .setUserService(new UserService())
  .setBanService(new BanService())
  .setGroupService(new GroupService())
  .setChatService(new ChatService())
  .setGroupChatService(new GroupChatService())
  .setAdsService(new AdsService())
  .setImpcostService(new ImpcostService())
  .setMembershipPriceService(new MembershipPriceService())
  .setOtpService(new OtpService())
  .setExpenseService(new ExpenseService())
  .setExpenseConfirmService(new ExpenseConfirmService())
  .setWithdrawAddressService(new WithdrawAddressService())
  .setTransactionService(new TransactionService())
  .setInnerTransactionService(new InnerTransactionService());
server.listen(port, () => {
  console.log(`Listening socket server on *:${port}`);
});
socketServer.initServer(server);