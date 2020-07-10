export class Expense {
  public id: number;
  public userId: number;
  public docPath: string;
  public amount: number;
  public confirmCount: number;
  public requestTime: number;
  public confirmTime: number;
  public status: number;

  public static readonly STATUS = {
    CREATED: 0,
    REQUESTED: 1,
    REJECTED: 2,
    CONFIRMED: 3,
  };
}