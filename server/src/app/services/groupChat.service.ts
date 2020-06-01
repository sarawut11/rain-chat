import { query } from "../utils/db";
import configs from "@configs";

export class GroupChatService {
  /**
   * Get Group Message
   * @param groupId     Group Id
   * @return  message   Group Message
   * @return  time      Time
   * @return  from_user Sender ID
   * @return  avatar    Sender Avatar
   */
  getGroupMsg(groupId, start, count) {
    const _sql =
      `SELECT * FROM (SELECT g.message,g.attachments,g.time,g.from_user,g.to_group_id, i.avatar ,i.name FROM ${groupId === configs.rain_group_id ? "rain_group_msg" : "group_msg"}  As g inner join user_info AS i ON g.from_user = i.id  WHERE to_group_id = ? order by time desc limit ?,?) as n order by n.time;`;
    return query(_sql, [groupId, start, count]);
  }

  /**
   * Get group members
   * @param   groupId   Group Id
   * @return  group_member_id  Group Member Id
   */
  getGroupMember(groupId) {
    const _sql =
      "SELECT g.user_id, u.socketid, u.username, u.name, u.email, u.avatar, u.intro, u.balance, u.wallet_address FROM group_user_relation AS g inner join user_info AS u ON g.user_id = u.id WHERE to_group_id = ?";
    return query(_sql, groupId);
  }

  /**
   * Get group information
   * @param   arr Including at least one groupId groupName
   * @return
   */
  getGroupInfo(arr) {
    const _sql =
      "SELECT to_group_id, name, group_notice, creator_id, create_time FROM group_info  WHERE to_group_id = ? OR name = ? ;";
    return query(_sql, arr);
  }

  /**
   * Save chat history
   * @param   user_id  User Id
   * @param   groupId  Group Id
   * @param   message  Message
   * @param   name     Username
   * @param   time     Time
   * @return
   */

  saveGroupMsg({ from_user, to_group_id, message, time, attachments }) {
    const data = [from_user, to_group_id, message, time, attachments];
    const _sql =
      `INSERT INTO ${to_group_id === configs.rain_group_id ? "rain_group_msg" : "group_msg"}
      (from_user,to_group_id,message ,time, attachments) VALUES(?,?,?,?,?); `;
    return query(_sql, data);
  }

  /**
   * Add members to the group and return to the group members
   * @param   user_id   User Id
   * @param   groupId   Group Id
   * @return
   */
  addGroupUserRelation(user_id, groupId) {
    const data = [groupId, user_id];
    const _sql = " INSERT INTO  group_user_relation(to_group_id,user_id) VALUES(?,?); ";
    return query(_sql, data);
  }

  getUnreadCount({ sortTime, to_group_id }) {
    const data = [sortTime, to_group_id];
    const _sql =
      "SELECT count(time) as unread FROM group_msg as p where p.time > ? and p.to_group_id = ?;";
    return query(_sql, data);
  }
}
