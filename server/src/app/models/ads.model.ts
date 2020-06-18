export class Ads {
  public id: number;
  public userId: number;
  public type: number;
  public status: number;
  public impressions: number;
  public costPerImp: number;
  public title: string;
  public description: string;
  public buttonLabel: string;
  public assetLink: string;
  public link: string;
  public lastTime: number;
  public time: number;

  public static readonly TYPE = {
    None: 0,
    RainRoomAds: 1,
    StaticAds: 2,
  };
  public static readonly STATUS = {
    Created: 0,
    Pending: 1,
    Approved: 2,
    Rejected: 3,
    PendingPurchase: 4,
    PendingConfirm: 5,
    Paid: 6,
  };
}