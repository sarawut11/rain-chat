export class Ban {
  public id: number;
  public userId: number;
  public blockerId: number; // type === DIRECT => user_info.id | type === GROUP => group_info.groupId
  public type: number;
  public time: number;

  public static readonly TYPE = {
    DIRECT: 0,
    GROUP: 1,
  };
}