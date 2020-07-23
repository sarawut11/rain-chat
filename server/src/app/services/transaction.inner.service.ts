import * as moment from "moment";
import { query, getInArraySQL, now } from "@utils";
import { InnerTransaction } from "@models";

export class InnerTransactionService {

  readonly TABLE_NAME = "inner_transaction_info";
  readonly COL = {
    id: "id",
    userId: "userId",
    type: "type",
    amount: "amount",
    time: "time",
  };

  addTrans(userIds: number[], reward: number, type: number) {
    if (userIds.length === 0) return;
    const data = [];
    reward /= userIds.length;
    let sql = `
      INSERT INTO ${this.TABLE_NAME} (
        ${this.COL.userId},
        ${this.COL.type},
        ${this.COL.amount},
        ${this.COL.time}
      ) VALUE
    `;
    const time = now();
    userIds.forEach(userId => {
      sql += `(?,?,?,?),`;
      data.push(userId, type, reward, time);
    });
    sql = sql.substring(0, sql.length - 1);
    return query(sql, data);
  }

  getTransByType(type: number) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE ${this.COL.type} = ?;`;
    return query(sql, type);
  }

  getUserTrans(userId: number) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE ${this.COL.userId} = ?;`;
    return query(sql, userId);
  }

  getUserPaymentTrans(userId: number) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.COL.userId} = ? AND
        ${this.COL.type} != ?;`;
    return query(sql, [userId, InnerTransaction.TYPE.RAIN]);
  }

  getUserTransByType(userId: number, type: number) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.COL.userId} = ? AND
        ${this.COL.type} = ?;`;
    return query(sql, [userId, type]);
  }

  getUsersTransByType(userIds: number[], type: number) {
    const userIdArray = getInArraySQL(userIds);
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.COL.userId} IN (${userIdArray}) AND
        ${this.COL.type} = ?;`;
    return query(sql, [type]);
  }

  async getAmountByType(type: number): Promise<number> {
    const trans: InnerTransaction[] = await this.getTransByType(type);
    let amount = 0;
    trans.forEach(tran => amount += tran.amount);
    return amount;
  }

  async getUserAmountByType(userId: number, type: number): Promise<number> {
    const trans: InnerTransaction[] = await this.getUserTransByType(userId, type);
    let amount = 0;
    trans.forEach(tran => amount += tran.amount);
    return amount;
  }

  async getAmount(userId: number): Promise<number> {
    const trans: InnerTransaction[] = await this.getUserTrans(userId);
    let amount = 0;
    trans.forEach(tran => amount += tran.amount);
    return amount;
  }

  async getPayment(userId: number): Promise<number> {
    const trans: InnerTransaction[] = await this.getUserPaymentTrans(userId);
    let amount = 0;
    trans.forEach(tran => amount += tran.amount);
    return amount;
  }

  async getPaymentByLastWeeks(userId: number, weeks: number): Promise<{
    payment: number,
    weekPayments: number[]
  }> {
    const trans: InnerTransaction[] = await this.getUserPaymentTrans(userId);
    let payment = 0;
    trans.forEach(tran => payment += tran.amount);
    const weekPayments: number[] = [];
    for (let i = 0; i < weeks; i++) {
      const weekStartTime = moment().utc().startOf("week").subtract(i + 1, "week").unix();
      let weekEndTime = moment().utc().startOf("week").subtract(i, "week").unix();
      if (i === 0) weekEndTime = now();

      let weekPayment = 0;
      trans.filter(tran => tran.time > weekStartTime && tran.time <= weekEndTime).forEach(tran => {
        weekPayment += tran.amount;
      });
      weekPayments.push(weekPayment);
    }
    return {
      payment,
      weekPayments
    };
  }

  async getTotalRainedAmount(): Promise<number> {
    const sql = `
      SELECT ${this.COL.amount}
      FROM ${this.TABLE_NAME}
      WHERE ${this.COL.type} = ?;`;
    const trans: InnerTransaction[] = await query(sql, InnerTransaction.TYPE.RAIN);
    let amount = 0;
    trans.forEach(tran => amount += tran.amount);
    return amount;
  }
}