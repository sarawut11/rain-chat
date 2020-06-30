import { query } from "../utils/db";
import configs from "@configs";

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

  getGroupMsg(groupId, start, count) {
    const sql =
      `SELECT * FROM (
        SELECT g.message,g.attachments,g.time,g.fromUser,g.groupId,i.avatar,i.name
        FROM ${groupId === configs.rain.group_id ? this.RAIN_G_TNAME : this.TABLE_NAME}
        As g inner join user_info AS i ON g.fromUser = i.id
        WHERE groupId = ? order by time desc limit ?,?)
      As n order by n.time;`;
    return query(sql, [groupId, start, count]);
  }

  /**
   * Get group members
   * @param   groupId   Group Id
   * @return  group_member_id  Group Member Id
   */
  getGroupMember(groupId) {
    const sql = `
      SELECT
        g.userId, u.socketid, u.username, u.name, u.email, u.avatar, u.intro, u.balance
      FROM group_user_relation AS g
      INNER JOIN user_info AS u
      ON g.userId = u.id WHERE groupId = ?`;
    return query(sql, groupId);
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
      `INSERT INTO ${groupId === configs.rain.group_id ? this.RAIN_G_TNAME : this.TABLE_NAME}(
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
      FROM ${groupId === configs.rain.group_id ? this.RAIN_G_TNAME : this.TABLE_NAME} as p
      WHERE
        p.${this.COLUMNS.time} > ? AND
        p.${this.COLUMNS.groupId} = ?;`;
    return query(sql, data);
  }
}
