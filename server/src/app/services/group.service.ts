import { query } from "@utils";
import { Group } from "@models";

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
  async findMatchGroups(name: string): Promise<Group[]> {
    const sql = `SELECT * FROM ${this.GROUP_TABLE} WHERE ${this.GROUP_COLUMNS.name} LIKE ?;`;
    const groups: Group[] = await query(sql, name);
    return groups;
  }

  getGroupById(id: number) {
    const sql = `SELECT * FROM ${this.GROUP_TABLE} WHERE ${this.GROUP_COLUMNS.id} = ?;`;
    return query(sql, id);
  }

  async getGroupByGroupId(groupId: string) {
    const sql = `SELECT * FROM ${this.GROUP_TABLE} WHERE ${this.GROUP_COLUMNS.groupId} = ? LIMIT 1;`;
    const groups: Group[] = await query(sql, groupId);
    if (groups.length === 0) return undefined;
    return groups[0];
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
