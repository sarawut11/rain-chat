export class Otp {
  public id: number;
  public userId: number;
  public code: string;
  public type: number;
  public time: number;

  public static readonly TYPE = {
    WITHDRAW: 0,
    SIGNUP: 1,
  };
}