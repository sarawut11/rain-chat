import { query } from "../utils/db";
import * as moment from "moment";
import { DefaultModel, Expense } from "../models";

export class ExpenseService {
  readonly TABLE_NAME = "expense_info";
  readonly COL = {
    id: "id",
    userId: "userId",
    docPath: "docPath",
    amount: "amount",
    confirmCount: "confirmCount",
    rejectCount: "rejectCount",
    requestTime: "requestTime",
    confirmTime: "confirmTime",
    status: "status",
  };

  async createExpenseRequest(userId: number, docPath: string, amount: number): Promise<DefaultModel> {
    const sql = `
      INSERT INTO ${this.TABLE_NAME}(
        ${this.COL.userId},
        ${this.COL.docPath},
        ${this.COL.amount},
        ${this.COL.requestTime}
      ) VALUES (?,?,?,?);`;
    const result = await query(sql, [userId, docPath, amount, moment().utc().unix()]);
    return result;
  }

  async getAllExpenses(): Promise<Expense[]> {
    const sql = `SELECT * FROM ${this.TABLE_NAME};`;
    const expenses: Expense[] = await query(sql);
    return expenses;
  }

  async getExpenseById(expId: number): Promise<Expense> {
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.COL.id} = ?;`;
    const expenses: Expense[] = await query(sql, expId);
    if (expenses.length === 0) return undefined;
    return expenses[0];
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.COL.userId} = ?;`;
    const expenses: Expense[] = await query(sql, userId);
    return expenses;
  }

  async updateConfirmCount(expId: number): Promise<DefaultModel> {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.COL.confirmCount} = ${this.COL.confirmCount} + 1
      WHERE ${this.COL.id} = ?;`;
    const result = await query(sql, expId);
    return result;
  }

  async updateRejectCount(expId: number): Promise<DefaultModel> {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.COL.rejectCount} = ${this.COL.rejectCount} + 1
      WHERE ${this.COL.id} = ?;`;
    const result = await query(sql, expId);
    return result;
  }
}