export class Transaction {
  public id: number;
  public userId: number;
  public transactionId: string;
  public type: number;
  public status: number;
  public paidAmount: number;
  public expectAmount: number;
  public confirmTime: number;
  public time: number;

  public static readonly STATUS = {
    REQUESTED: 0,
    PENDING: 1,
    INSUFFICIENT_BALANCE: 2,
    CONFIRMED: 3
  };

  public static readonly TYPE = {
    ADS: 0,
    MEMBERSHIP: 1,
    VITAE_RAIN: 2
  };
}