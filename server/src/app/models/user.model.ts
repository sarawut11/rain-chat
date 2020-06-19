export class User {
  public id: number;
  public username: string;
  public password: string;
  public name: string;
  public email: string;
  public avatar: string;
  public intro: string;
  public socketid: string;
  public sponsor: number;
  public balance: number;
  public popBalance: number;
  public refcode: string;
  public role: string;
  public lastUpgradeTime: number;

  public static readonly ROLE = {
    OWNER: "OWNER",
    MODERATOR: "MODERATOR",
    FREE: "FREE",
    UPGRADED_USER: "UPGRADED",
  };
}