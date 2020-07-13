export class WalletNotifyDetail {
  public account: string;
  public address: string;
  public category: string;
  public amount: number;
  public vout: number;

  public static readonly CATEGORY = {
    send: "send",
    receive: "receive",
  };
}