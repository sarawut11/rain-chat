import { socketServer, socketEventNames } from "@sockets";
import { ServicesContext } from "@context";
import { Transaction, User } from "@models";

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

    console.log(`Expire Transaction => Success | transactionRequestId:${tranId}, username:${userInfo.username}`);
  }

  async confrimTransactionRequest(tranId: number, txId: string, paidAmount: number, confirmTime: number) {
    const { userService, transactionService } = ServicesContext.getInstance();
    const tranInfo: Transaction = await transactionService.getTransactionById(tranId);
    if (tranInfo === undefined) return;
    if (tranInfo.status !== Transaction.STATUS.REQUESTED) return;

    await transactionService.confirmTransaction(tranId, txId, paidAmount, confirmTime);

    const userInfo: User = await userService.findUserById(tranInfo.userId);
    if (userInfo === undefined) return;
    socketServer.emitTo(userInfo.socketid, socketEventNames.TransactionConfirmed, {
      type: tranInfo.type,
      paidAmount,
      expectAmount: tranInfo.expectAmount,
      time: tranInfo.time,
      confirmTime,
    });

    console.log(`Confirm Transaction => Success | transactionRequestId:${tranId}, username:${userInfo.username}`);
  }
}