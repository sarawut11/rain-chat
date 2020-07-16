import { query, now } from "../utils";
import { DefaultModel, ExpenseConfirm } from "../models";

export class ExpenseConfirmService {
  public readonly TABLE_NAME = "expense_confirm_info";
  public readonly COL = {
    id: "id",
    userId: "userId",
    expenseId: "expenseId",
    status: "status",
    comment: "comment",
    time: "time",
  };

  async approveExpense(userId: number, expenseId: number): Promise<DefaultModel> {
    const existingConfirm = await this.getExpenseConfirm(userId, expenseId);
    if (existingConfirm !== undefined) return undefined;

    const sql = `
      INSERT INTO ${this.TABLE_NAME}(
        ${this.COL.userId},
        ${this.COL.expenseId},
        ${this.COL.status},
        ${this.COL.time}
      ) VALUES(?,?,?,?);`;
    const result = await query(sql, [userId, expenseId, ExpenseConfirm.STATUS.Approve, now()]);
    return result;
  }

  async rejectExpense(userId: number, expenseId: number): Promise<DefaultModel> {
    const existingConfirm = await this.getExpenseConfirm(userId, expenseId);
    if (existingConfirm !== undefined) return undefined;

    const sql = `
      INSERT INTO ${this.TABLE_NAME}(
        ${this.COL.userId},
        ${this.COL.expenseId},
        ${this.COL.status},
        ${this.COL.time}
      ) VALUES(?,?,?,?);`;
    const result = await query(sql, [userId, expenseId, ExpenseConfirm.STATUS.Reject, now()]);
    return result;
  }

  async getExpenseConfirm(userId: number, expenseId: number): Promise<ExpenseConfirm> {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.COL.userId} = ? AND
        ${this.COL.expenseId} = ?
      LIMIT 1;`;
    const confirms: ExpenseConfirm[] = await query(sql, [userId, expenseId]);
    if (confirms.length === 0) return undefined;
    return confirms[0];
  }

  async getExpenseConfirms(expenseId: number): Promise<ExpenseConfirm[]> {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE ${this.COL.expenseId} = ?;`;
    const confirms: ExpenseConfirm[] = await query(sql, expenseId);
    return confirms;
  }

  async getExpenseConfirmsCount(expenseId: number, status: number): Promise<number> {
    const confirms = await this.getExpenseConfirms(expenseId);
    return confirms.filter(confirm => confirm.status === status).length;
  }
}