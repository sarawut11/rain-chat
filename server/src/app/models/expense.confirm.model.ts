export class ExpenseConfirm {
  public id: number;
  public userId: number;
  public expenseId: number;
  public status: number;
  public comment: string;
  public time: number;

  public static readonly STATUS = {
    Approve: 1,
    Reject: 2,
  };
}