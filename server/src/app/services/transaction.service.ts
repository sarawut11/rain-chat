import { query } from "../utils/db";
import configs from "@configs";
import * as moment from "moment";
import * as uniqid from "uniqid";
import { Transaction } from "../models/transaction.model";

export class TransactionService {

  readonly TABLE_NAME = "transaction_info";
  readonly columns = {
    id: "id",
    userId: "userId",
    transactionId: "transactionId",
    type: "type",
    status: "status",
    paidAmount: "paidAmount",
    expectAmount: "expectAmount",
    confirmTime: "confirmTime",
    time: "time",
  };

  createTransactionRequest(userId: number, type: number, expectAmount: number) {
    const _sql = `
    INSERT INTO ${this.TABLE_NAME}(
      ${this.columns.userId},
      ${this.columns.transactionId},
      ${this.columns.type},
      ${this.columns.status},
      ${this.columns.expectAmount},
      ${this.columns.time})
    values(?,?,?,?,?,?);`;
    return query(_sql, [userId, uniqid(), type, Transaction.STATUS.REQUESTED, expectAmount, moment().utc().unix()]);
  }

  confirmTransactionRequest(userId: number, type: number, amount: number, confirmTime: number) {
    const _sql = `
    UPDATE ${this.TABLE_NAME}
    SET
      ${this.columns.status} = ?,
      ${this.columns.paidAmount} = ?,
      ${this.columns.confirmTime} = ?
    WHERE
      ${this.columns.userId} = ? AND
      ${this.columns.type} = ?
    SORT BY ${this.columns.time} DESC LIMIT 1;`;
    return query(_sql, [Transaction.STATUS.CONFIRMED, amount, confirmTime, userId, type]);
  }

  getTransactions(type: number) {
    const _sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.columns.type} = ?;`;
    return query(_sql, type);
  }

  async getAdsTotalPurchaseAmount() {
    const trans: Transaction[] = await this.getTransactions(Transaction.TYPE.ADS);
    let totalAmount = 0;
    trans.forEach(tran => totalAmount += tran.paidAmount);
    return totalAmount;
  }

  async getTotalMembershipAmount() {
    const trans: Transaction[] = await this.getTransactions(Transaction.TYPE.MEMBERSHIP);
    let totalAmount = 0;
    trans.forEach(tran => totalAmount += tran.paidAmount);
    return totalAmount;
  }
}