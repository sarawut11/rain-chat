export class User {
  public id: number;
  public role: string;

  public static readonly ROLE = {
    OWNER: "OWNER",
    MODERATOR: "MODERATOR",
    FREE: "FREE",
    UPGRADED_USER: "UPGRADED",
  };
}