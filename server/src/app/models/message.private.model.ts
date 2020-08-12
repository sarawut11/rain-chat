export class PrivateMessage {
  public id: number;
  public fromUser: number;
  public toUser: number;
  public message: string;
  public time: number;
  public attachments: any;
}