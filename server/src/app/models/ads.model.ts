export class Ads {
  public id: number;
  public userId: number;
  public type: number;
  public status: number;
  public impressions: number;
  public title: string;
  public description: string;
  public buttonLabel: string;
  public assetLink: string;
  public link: string;
  public lastTime: number;
  public time: number;

  public static readonly TYPE = {
    RainRoomAds: 0,
    StaticAds: 1,
  };
  public static readonly STATUS = {
    Created: 0,
    Pending: 1,
    Approved: 2,
    Rejected: 3,
  };
}