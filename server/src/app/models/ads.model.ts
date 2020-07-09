export class Ads {
  // Ads Info
  public id: number;
  public userId: number;
  public type: number;
  public status: number;
  public impressions: number;
  public givenImp: number;
  public costPerImp: number;
  public paidAmount: number;
  public title: string;
  public description: string;
  public buttonLabel: string;
  public assetLink: string;
  public link: string;
  public lastTime: number;
  public time: number;
  public reviewer: number;

  // Extension Section
  public creatorName: string;
  public creatorUsername: string;
  public creatorAvatar: string;
  public reviewerName: string;
  public reviewerUsername: string;
  public reviewerAvatar: string;
  public email: string;
  public intro: string;
  public role: string;

  public static readonly TYPE = {
    RainRoomAds: 0,
    StaticAds: 1,
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