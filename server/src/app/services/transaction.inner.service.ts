import { query } from "../utils/db";
import configs from "@configs";
import * as moment from "moment";
import * as uniqid from "uniqid";
import { getInArraySQL } from "../utils/utils";
import { InnerTransaction } from "../models";
import { time } from "console";

export class InnerTransactionService {

  readonly TABLE_NAME = "inner_transaction_info";
  readonly COLUMNS = {
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
        ${this.COLUMNS.userId},
        ${this.COLUMNS.type},
        ${this.COLUMNS.amount},
        ${this.COLUMNS.time}
      ) VALUE
    `;
    const time = moment().utc().unix();
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
      WHERE ${this.COLUMNS.type} = ?;`;
    return query(sql, type);
  }

  getUserTrans(userId: number) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE ${this.COLUMNS.userId} = ?;`;
    return query(sql, userId);
  }

  getUserTransByType(userId: number, type: number) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.COLUMNS.userId} = ? AND
        ${this.COLUMNS.type} = ?;`;
    return query(sql, [userId, type]);
  }

  getUsersTransByType(userIds: number[], type: number) {
    const userIdArray = getInArraySQL(userIds);
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.COLUMNS.userId} IN (${userIdArray}) AND
        ${this.COLUMNS.type} = ?;`;
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

  async getAmountByLastWeeks(userId: number, weeks: number): Promise<{
    payment: number,
    weekPayments: number[]
  }> {
    const trans: InnerTransaction[] = await this.getUserTrans(userId);
    let payment = 0;
    trans.forEach(tran => payment += tran.amount);
    const weekPayments: number[] = [];
    for (let i = 0; i < weeks; i++) {
      const weekStartTime = moment().utc().startOf("week").subtract(i + 1, "week").unix();
      let weekEndTime = moment().utc().startOf("week").subtract(i, "week").unix();
      if (i === 0) weekEndTime = moment().utc().unix();

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
}