import { query } from "@utils";
import { GroupMessage } from "@models";

export class GroupChatService {
  readonly RAIN_G_TNAME = "rain_group_msg";
  readonly TABLE_NAME = "group_msg";
  readonly COLUMNS = {
    id: "id",
    fromUser: "fromUser",
    groupId: "groupId",
    message: "message",
    time: "time",
    attachments: "attachments",
  };
  readonly RAIN_GROUP_ID = process.env.RAIN_GROUP_ID;

  getGroupMsg(groupId, start, count) {
    const sql =
      `SELECT * FROM (
        SELECT g.message,g.attachments,g.time,g.fromUser,g.groupId,i.avatar,i.name
        FROM ${groupId === this.RAIN_GROUP_ID ? this.RAIN_G_TNAME : this.TABLE_NAME}
        As g inner join user_info AS i ON g.fromUser = i.id
        WHERE groupId = ? order by time desc limit ?,?)
      As n order by n.time;`;
    return query(sql, [groupId, start, count]);
  }

  /**
   * Save chat history
   * @param   userId  User Id
   * @param   groupId  Group Id
   * @param   message  Message
   * @param   name     Username
   * @param   time     Time
   * @return
   */

  saveGroupMsg({ fromUser, groupId, message, time, attachments }) {
    const data = [fromUser, groupId, message, time, attachments];
    const sql =
      `INSERT INTO ${groupId === this.RAIN_GROUP_ID ? this.RAIN_G_TNAME : this.TABLE_NAME}(
        ${this.COLUMNS.fromUser},
        ${this.COLUMNS.groupId},
        ${this.COLUMNS.message},
        ${this.COLUMNS.time},
        ${this.COLUMNS.attachments}
      ) VALUES(?,?,?,?,?); `;
    return query(sql, data);
  }

  getUnreadCount({ sortTime, groupId }) {
    const data = [sortTime, groupId];
    const sql = `
      SELECT count(time) as unread
      FROM ${groupId === this.RAIN_GROUP_ID ? this.RAIN_G_TNAME : this.TABLE_NAME} as p
      WHERE
        p.${this.COLUMNS.time} > ? AND
        p.${this.COLUMNS.groupId} = ?;`;
    return query(sql, data);
  }

  async getLastRainGroupMsg(limit: number): Promise<GroupMessage[]> {
    const sql = `
      SELECT ${this.COLUMNS.fromUser}
      FROM (
        SELECT
          ${this.COLUMNS.fromUser},
          max(${this.COLUMNS.time}) as ${this.COLUMNS.time}
        FROM ${this.RAIN_G_TNAME}
        GROUP BY ${this.COLUMNS.fromUser}
      ) as t1
      WHERE ${this.COLUMNS.fromUser} != 0
      ORDER BY ${this.COLUMNS.time} DESC LIMIT ?;`;
    const msg: GroupMessage[] = await query(sql, limit);
    return msg;
  }
}
