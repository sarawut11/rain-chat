import { query } from "../utils/db";

export class GroupService {
  readonly GROUP_TABLE = "group_info";
  readonly GROUP_COLUMNS = {
    id: "id",
    groupId: "groupId",
    name: "name",
    description: "description",
    creatorId: "creatorId",
    createTime: "createTime"
  };

  readonly GROUP_USER_TABLE = "group_user_relation";
  readonly GROUP_USER_COLUMNS = {
    id: "id",
    groupId: "groupId",
    userId: "userId",
  };

  // Fuzzy matching users
  fuzzyMatchGroups(name) {
    const sql = `
      SELECT * FROM ${this.GROUP_TABLE} WHERE name LIKE ?;
    `;
    return query(sql, name);
  }

  getGroupById(id: number) {
    const sql = `SELECT * FROM ${this.GROUP_TABLE} WHERE ${this.GROUP_COLUMNS.id} = ?;`;
    return query(sql, id);
  }

  getGroupByGroupId(groupId: string) {
    const sql = `SELECT * FROM ${this.GROUP_TABLE} WHERE ${this.GROUP_COLUMNS.groupId} = ?;`;
    return query(sql, groupId);
  }

  // Join the group
  joinGroup(userId, groupId) {
    const sql = `
      INSERT INTO ${this.GROUP_USER_TABLE}(
        ${this.GROUP_USER_COLUMNS.userId},
        ${this.GROUP_USER_COLUMNS.groupId}
      ) VALUES(?,?);`;
    return query(sql, [userId, groupId]);
  }

  // See if a user is in a group
  isInGroup(userId, groupId) {
    const sql = `
      SELECT * FROM ${this.GROUP_USER_TABLE}
      WHERE
        ${this.GROUP_USER_COLUMNS.userId} = ? AND
        ${this.GROUP_USER_COLUMNS.groupId} = ?;`;
    return query(sql, [userId, groupId]);
  }

  // Create New Group
  createGroup(arr) {
    const sql = `INSERT INTO ${this.GROUP_TABLE}(
      ${this.GROUP_COLUMNS.groupId},
      ${this.GROUP_COLUMNS.name},
      ${this.GROUP_COLUMNS.description},
      ${this.GROUP_COLUMNS.creatorId},
      ${this.GROUP_COLUMNS.createTime}
    ) VALUES (?,?,?,?,?)`;
    return query(sql, arr);
  }

  // Update Group Information
  updateGroupInfo({ name, description, groupId }) {
    const sql = `
      UPDATE ${this.GROUP_TABLE}
      SET
        ${this.GROUP_COLUMNS.name} = ?,
        ${this.GROUP_COLUMNS.description} = ?
      WHERE
        ${this.GROUP_COLUMNS.groupId} = ? limit 1;`;
    return query(sql, [name, description, groupId]);
  }

  // Leave
  leaveGroup(userId, groupId) {
    const sql = `
      DELETE FROM ${this.GROUP_USER_TABLE}
      WHERE
        ${this.GROUP_USER_COLUMNS.userId} = ? AND
        ${this.GROUP_USER_COLUMNS.groupId} = ?;`;
    return query(sql, [userId, groupId]);
  }
}
