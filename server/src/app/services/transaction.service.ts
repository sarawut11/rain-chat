import { query } from "../utils/db";
import configs from "@configs";
import * as moment from "moment";
import * as uniqid from "uniqid";
import { Transaction } from "../models/transaction.model";

export class TransactionService {

  readonly TABLE_NAME = "wallet_transaction_info";
  readonly columns = {
    id: "id",
    userId: "userId",
    transactionId: "transactionId",
    type: "type",
    status: "status",
    paidAmount: "paidAmount",
    expectAmount: "expectAmount",
    confirmTime: "confirmTime",
    details: "details",
    time: "time",
  };

  createTransactionRequest(userId: number, type: number, expectAmount: number, details?: string) {
    const sql = `
    INSERT INTO ${this.TABLE_NAME}(
      ${this.columns.userId},
      ${this.columns.transactionId},
      ${this.columns.type},
      ${this.columns.status},
      ${this.columns.expectAmount},
      ${this.columns.time},
      ${this.columns.details})
    values(?,?,?,?,?,?,?);`;
    return query(sql, [userId, uniqid(), type, Transaction.STATUS.REQUESTED, expectAmount, moment().utc().unix(), details]);
  }

  confirmTransactionRequest(userId: number, type: number, amount: number, confirmTime: number) {
    const sql = `
    UPDATE ${this.TABLE_NAME}
    SET
      ${this.columns.status} = ?,
      ${this.columns.paidAmount} = ?,
      ${this.columns.confirmTime} = ?
    WHERE
      ${this.columns.userId} = ? AND
      ${this.columns.type} = ?
    ORDER BY ${this.columns.time} DESC LIMIT 1;`;
    return query(sql, [Transaction.STATUS.CONFIRMED, amount, confirmTime, userId, type]);
  }

  getLastPendingTransaction(userId: number, type: number) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.columns.userId} = ? AND
        ${this.columns.type} = ? AND
        ${this.columns.status} = ?
      ORDER BY ${this.columns.time} DESC LIMIT 1;`;
    return query(sql, [userId, type, Transaction.STATUS.REQUESTED]);
  }

  getTransactions(type?: number) {
    let sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.columns.status} = ?`;
    if (type !== undefined)
      sql += `AND ${this.columns.type} = '${type}';`;
    return query(sql, Transaction.STATUS.CONFIRMED);
  }

  async getTotalPurchaseAmount(type: number) {
    const trans: Transaction[] = await this.getTransactions(type);
    let totalAmount = 0;
    trans.forEach(tran => totalAmount += tran.paidAmount);
    return totalAmount;
  }
}