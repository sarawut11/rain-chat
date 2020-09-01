import { query } from "@utils";
import { Group, User } from "@models";

const RAIN_GROUP_ID = process.env.RAIN_GROUP_ID;

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
  async isInGroup(userId, groupId): Promise<boolean> {
    const sql = `
      SELECT * FROM ${this.GROUP_USER_TABLE}
      WHERE
        ${this.GROUP_USER_COLUMNS.userId} = ? AND
        ${this.GROUP_USER_COLUMNS.groupId} = ?;`;
    const result: any[] = await query(sql, [userId, groupId]);
    return result.length !== 0;
  }

  // Create New Group
  createGroup({ groupId, name, description, creatorId, createTime }:
    { groupId: string, name: string, description: string, creatorId: number, createTime: number }) {
    const sql = `INSERT INTO ${this.GROUP_TABLE}(
      ${this.GROUP_COLUMNS.groupId},
      ${this.GROUP_COLUMNS.name},
      ${this.GROUP_COLUMNS.description},
      ${this.GROUP_COLUMNS.creatorId},
      ${this.GROUP_COLUMNS.createTime}
    ) VALUES (?,?,?,?,?)`;
    return query(sql, [groupId, name, description, creatorId, createTime]);
  }

  // Update Group Information
  updateGroupInfo(groupId: string, name: string, description: string) {
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

  async getGroupMember(groupId): Promise<User[]> {
    const sql = `
      SELECT
        g.userId, u.username, u.name, u.avatar, u.intro, u.socketid, u.ban
      FROM user_info AS u
      INNER JOIN ${this.GROUP_USER_TABLE} AS g
      ON g.${this.GROUP_USER_COLUMNS.userId} = u.id
      WHERE g.${this.GROUP_USER_COLUMNS.groupId} = ?`;
    const members: User[] = await query(sql, groupId);
    if (groupId === RAIN_GROUP_ID) {
      return members.filter(member => member.ban === 0);
    }
    return members;
  }
}
