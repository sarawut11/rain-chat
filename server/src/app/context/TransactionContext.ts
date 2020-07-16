import { socketServer } from "../socket/app.socket";
import { ServicesContext } from "./ServicesContext";
import { socketEventNames } from "../socket/resource.socket";
import { Transaction, User } from "../models";

export class TransactionContext {
  static instance: TransactionContext;

  static getInstance(): TransactionContext {
    if (!TransactionContext.instance) {
      TransactionContext.instance = new TransactionContext();
    }
    return TransactionContext.instance;
  }

  async expireTransactionRequest(tranId: number) {
    const { userService, transactionService } = ServicesContext.getInstance();

    const tranInfo: Transaction = await transactionService.getTransactionById(tranId);
    if (tranInfo === undefined) return;
    if (tranInfo.status !== Transaction.STATUS.REQUESTED) return;

    // Still in requested, meaning didn't make transaction yet, expire it
    await transactionService.expireTransactionRequest(tranId);

    // Send expire socket
    const userInfo: User = await userService.findUserById(tranInfo.userId);
    if (userInfo === undefined) return;
    socketServer.emitTo(userInfo.socketid, socketEventNames.TransactionExpired, {
      type: tranInfo.type,
      expectAmount: tranInfo.expectAmount,
      time: tranInfo.time,
    });
  }
}