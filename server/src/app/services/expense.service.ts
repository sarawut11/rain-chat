import { query, now } from "../utils";
import { DefaultModel, Expense } from "../models";

export class ExpenseService {
  readonly TABLE_NAME = "expense_info";
  readonly COL = {
    id: "id",
    userId: "userId",
    docPath: "docPath",
    amount: "amount",
    time: "time",
    status: "status",
  };

  async createExpenseRequest(userId: number, docPath: string, amount: number): Promise<DefaultModel> {
    const sql = `
      INSERT INTO ${this.TABLE_NAME}(
        ${this.COL.userId},
        ${this.COL.docPath},
        ${this.COL.amount},
        ${this.COL.time}
      ) VALUES (?,?,?,?);`;
    const result = await query(sql, [userId, docPath, amount, now()]);
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

  async updateExpenseStatus(expenseId: number, status: number): Promise<DefaultModel> {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET ${this.COL.status} = ?
      WHERE ${this.COL.id} = ?;`;
    const result = await query(sql, [status, expenseId]);
    return result;
  }
}