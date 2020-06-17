export class User {
  public id: number;
  public role: string;

  public static readonly ROLE = {
    COMPANY: "COMPANY",
    OWNER: "OWNER",
    MODERATOR: "MODERATOR",
    FREE: "FREE",
    UPGRADED_USER: "UPGRADED",
  };
}