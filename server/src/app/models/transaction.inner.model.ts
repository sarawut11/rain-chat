export class InnerTransaction {
  public id: number;
  public userId: number;
  public amount: number;
  public type: number;
  public time: number;

  public static readonly TYPE = {
    RAIN: 0,
    MEMBERSHIP_PURCHASE_SHARE: 1,
    ADS_PURCHASE_SHARE: 2,
    SPONSOR: 3,
  };
}