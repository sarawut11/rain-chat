import { ExpenseConfirm } from "./expense.confirm.model";

export class Expense {
  public id: number;
  public userId: number;
  public docPath: string;
  public amount: number;
  public time: number;
  public status: number;

  public approves: ExpenseConfirm[];
  public rejects: ExpenseConfirm[];

  public static readonly STATUS = {
    CREATED: 0,
    REQUESTED: 1,
    REJECTED: 2,
    APPROVED: 3,
  };
}