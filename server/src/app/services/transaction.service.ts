import { query, now, getTranExpireIn } from "@utils";
import { TransactionContext, ServicesContext } from "@context";
import { Transaction, DefaultModel, TransactionDetail, Setting } from "@models";

const COMPANY_USERID = Number(process.env.COMPANY_USERID);

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

  async createTransactionRequest(userId: number, type: number, expectAmount: number, details?: TransactionDetail): Promise<DefaultModel> {
    // To keep only one pending transaction at a time.
    const trans: Transaction = await this.getLastRequestedTransaction(userId);
    if (trans !== undefined && userId !== COMPANY_USERID) {
      console.log(`Register Transaction => Failed, User:${userId} still have pending or insufficient request.`);
      return undefined;
    }
    const sql = `
    INSERT INTO ${this.TABLE_NAME}(
      ${this.columns.userId},
      ${this.columns.type},
      ${this.columns.status},
      ${this.columns.expectAmount},
      ${this.columns.time},
      ${this.columns.details})
    values(?,?,?,?,?,?);`;
    const result: DefaultModel = await query(sql, [userId, type, Transaction.STATUS.REQUESTED, expectAmount, now(), JSON.stringify(details)]);

    const { settingService } = ServicesContext.getInstance();
    const tranExpire: number = await settingService.getSettingValue(Setting.KEY.TRANSACTION_REQUEST_EXPIRE);
    setTimeout(() => {
      TransactionContext.getInstance().expireTransactionRequest(result.insertId);
    }, tranExpire);
    return result;
  }

  expireTransactionRequest(tranId: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.columns.status} = ?
      WHERE
        ${this.columns.id} = ?;`;
    return query(sql, [Transaction.STATUS.EXPIRED, tranId]);
  }

  async getLastRequestedTransaction(userId: number): Promise<Transaction> {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.columns.userId} = ? AND
        ${this.columns.status} IN (?,?) AND
        ${this.columns.type} != ?
      LIMIT 1;`;
    const params = [userId, Transaction.STATUS.REQUESTED, Transaction.STATUS.INSUFFICIENT_REQUEST, Transaction.TYPE.WITHDRAW];
    const trans: Transaction[] = await query(sql, params);
    if (trans.length === 0) return undefined;

    if (trans[0].status === Transaction.STATUS.INSUFFICIENT_REQUEST) {
      return trans[0];
    }
    const expireIn: number = await getTranExpireIn(trans[0].time);
    if (expireIn <= 0) {
      TransactionContext.getInstance().expireTransactionRequest(trans[0].id);
      return undefined;
    }
    return trans[0];
  }

  async getTransactionById(tranId: number): Promise<Transaction> {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME} WHERE ${this.columns.id} = ?;`;
    const trans: Transaction[] = await query(sql, tranId);
    if (trans.length === 0) return undefined;
    return trans[0];
  }

  async getTransactions(type?: number): Promise<Transaction[]> {
    let sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.columns.status} = ?`;
    if (type !== undefined)
      sql += `AND ${this.columns.type} = '${type}';`;
    return query(sql, Transaction.STATUS.CONFIRMED);
  }

  async getTotalPurchaseAmount(type: number): Promise<number> {
    const trans: Transaction[] = await this.getTransactions(type);
    let totalAmount = 0;
    trans.forEach(tran => totalAmount += tran.paidAmount);
    return totalAmount;
  }

  async confirmTransaction(recordId: number, tranId: string, paidAmount: number, confirmTime: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.columns.transactionId} = ?,
        ${this.columns.paidAmount} = ?,
        ${this.columns.confirmTime} = ?,
        ${this.columns.status} = ?
      WHERE ${this.columns.id} = ?;`;
    return query(sql, [tranId, paidAmount, confirmTime, Transaction.STATUS.CONFIRMED, recordId]);
  }

  async setInsufficientTransaction(tranId: string, paidAmount: number, confirmTime: number, tranInfo: Transaction) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.columns.transactionId} = ?,
        ${this.columns.paidAmount} = ${this.columns.paidAmount} + ?,
        ${this.columns.confirmTime} = ?,
        ${this.columns.status} = ?
      WHERE ${this.columns.id} = ?;

      INSERT INTO ${this.TABLE_NAME}(
        ${this.columns.userId},
        ${this.columns.type},
        ${this.columns.status},
        ${this.columns.expectAmount},
        ${this.columns.time},
        ${this.columns.details})
      values(?,?,?,?,?,?);`;
    return query(sql, [
      tranId, paidAmount, confirmTime, Transaction.STATUS.INSUFFICIENT_BALANCE, tranInfo.id,
      tranInfo.userId, tranInfo.type, Transaction.STATUS.INSUFFICIENT_REQUEST, tranInfo.expectAmount - paidAmount, now(), tranInfo.details
    ]);
  }

  // Consider deleting this function later
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

  async getTotalAmountByType(type: number): Promise<number> {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.columns.type} = ? AND
        ${this.columns.status} = ?;`;
    const trans: Transaction[] = await query(sql, [type, Transaction.STATUS.CONFIRMED]);
    let amount = 0;
    trans.forEach(tran => amount += tran.paidAmount);
    return amount;
  }
}