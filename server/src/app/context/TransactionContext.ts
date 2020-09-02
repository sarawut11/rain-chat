import { socketServer, socketEventNames } from "@sockets";
import { ServicesContext } from "@context";
import { Transaction, User, Ads } from "@models";
import { getAdsIdFromTran } from "../utils/utils";

export class TransactionContext {
  static instance: TransactionContext;

  static getInstance(): TransactionContext {
    if (!TransactionContext.instance) {
      TransactionContext.instance = new TransactionContext();
    }
    return TransactionContext.instance;
  }

  constructor() {
    // Check Expired Transactions
    this.checkExpiredTrans();
  }

  async checkExpiredTrans() {
    const { transactionService, adsService } = ServicesContext.getInstance();
    const expiredTrans = await transactionService.getExpiredTrans();
    const expiredAdsId: number[] = [];

    await Promise.all(expiredTrans.map(tran => {
      if (tran.type === Transaction.TYPE.ADS) {
        expiredAdsId.push(getAdsIdFromTran(tran.details));
      }
      return transactionService.expireTransactionRequest(tran.id);
    }));
    console.log(`Expire Transactions => ${expiredTrans.length} trans expired.`);

    await Promise.all(expiredAdsId.map(adsId => {
      return adsService.updateStatus(adsId, Ads.STATUS.Approved);
    }));
    console.log(`Expire Ads => ${expiredAdsId.length} ads expired.`);
  }

  async expireTransactionRequest(tranId: number) {
    const { transactionService, adsService } = ServicesContext.getInstance();

    const tranInfo: Transaction = await transactionService.getTransactionById(tranId);
    if (tranInfo === undefined) return;
    if (tranInfo.status !== Transaction.STATUS.REQUESTED) return;

    // Still in requested, meaning didn't make transaction yet, expire it
    await transactionService.expireTransactionRequest(tranId);
    if (tranInfo.type === Transaction.TYPE.ADS) {
      const adsId = getAdsIdFromTran(tranInfo.details);
      await adsService.updateStatus(adsId, Ads.STATUS.Approved);
    }

    // Send expire socket
    socketServer.emitTo(tranInfo.userId, socketEventNames.TransactionExpired, {
      type: tranInfo.type,
      expectAmount: tranInfo.expectAmount,
      time: tranInfo.time,
    });

    console.log(`Expire Transaction => Success | transactionRequestId:${tranId}, userId:${tranInfo.userId}`);
  }

  async confrimTransactionRequest(tranId: number, txId: string, paidAmount: number, confirmTime: number) {
    const { transactionService } = ServicesContext.getInstance();
    const tranInfo: Transaction = await transactionService.getTransactionById(tranId);
    if (tranInfo === undefined) return;
    if (tranInfo.status !== Transaction.STATUS.REQUESTED) return;

    await transactionService.confirmTransaction(tranId, txId, paidAmount, confirmTime);

    socketServer.emitTo(tranInfo.userId, socketEventNames.TransactionConfirmed, {
      type: tranInfo.type,
      paidAmount,
      expectAmount: tranInfo.expectAmount,
      time: tranInfo.time,
      confirmTime,
    });

    console.log(`Confirm Transaction => Success | transactionRequestId:${tranId}, userId:${tranInfo.userId}`);
  }
}