export class User {
  public id: number;
  public userId: number;
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
  public lastVitaePostTime: number;
  public ban: number;
  public walletAddress: string;

  public static readonly ROLE = {
    COMPANY: "COMPANY",
    OWNER: "OWNER",
    MODERATOR: "MODERATOR",
    FREE: "FREE",
    UPGRADED_USER: "UPGRADED",
  };

  public static readonly BAN = {
    NONE: 0,
    BANNED: 1,
  };
}