import { query } from "../utils/db";

export class GroupService {
  // Fuzzy matching users
  fuzzyMatchGroups(link) {
    const _sql = `
      SELECT * FROM group_info WHERE name LIKE ?;
    `;
    return query(_sql, link);
  }

  // Join the group
  joinGroup(userId, toGroupId) {
    const _sql = "INSERT INTO group_user_relation(user_id,to_group_id) VALUES(?,?);";
    return query(_sql, [userId, toGroupId]);
  }

  // See if a user is in a group
  isInGroup(userId, toGroupId) {
    const _sql = "SELECT * FROM group_user_relation WHERE user_id = ? AND to_group_id = ?;";
    return query(_sql, [userId, toGroupId]);
  }

  // Create New Group
  createGroup(arr) {
    const _sql =
      "INSERT INTO group_info (to_group_id,name,group_notice,creator_id,create_time) VALUES (?,?,?,?,?)";
    return query(_sql, arr);
  }

  // Update Group Information
  updateGroupInfo({ name, group_notice, to_group_id }) {
    const _sql = "UPDATE group_info SET name = ?, group_notice = ? WHERE to_group_id= ? limit 1 ; ";
    return query(_sql, [name, group_notice, to_group_id]);
  }

  // Leave
  leaveGroup(userId, toGroupId) {
    const _sql = "DELETE FROM group_user_relation WHERE user_id = ? AND to_group_id = ? ;";
    return query(_sql, [userId, toGroupId]);
  }
}
