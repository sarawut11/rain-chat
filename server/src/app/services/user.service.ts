import * as moment from "moment";
import { query } from "../utils/db";
import { getInArraySQL } from "../utils/utils";
import { isNullOrUndefined } from "util";
import configs from "@configs";
import { User, UserRelation } from "../models";

export class UserService {
  readonly USER_TABLE = "user_info";
  readonly USER_COL = {
    id: "id",
    username: "username",
    password: "password",
    name: "name",
    email: "email",
    avatar: "avatar",
    intro: "intro",
    socketId: "socketid",
    sponsorId: "sponsor",
    walletAddress: "walletAddress",
    balance: "balance",
    popBalance: "popBalance",
    refcode: "refcode",
    role: "role",
    lastUpgradeTime: "lastUpgradeTime",
    lastVitaePostTime: "lastVitaePostTime",
    ban: "ban",
  };

  readonly USER_REL_TABLE = "user_user_relation";
  readonly USER_REL_COL = {
    id: "id",
    userId: "userId",
    fromUser: "fromUser",
    remark: "remark",
    shield: "shield",
    time: "time"
  };

  constructor() {
    // Clear All User's socketId
    this.clearAllSocketIds();
  }

  // Fuzzy matching users
  async findMatchUsers(username: string): Promise<User[]> {
    const sql = `
      SELECT * FROM ${this.USER_TABLE}
      WHERE ${this.USER_COL.username} LIKE ?;`;
    const users: User[] = await query(sql, username);
    return users;
  }

  // Register User
  insertUser(value) {
    const sql = `
      INSERT INTO ${this.USER_TABLE}(
        ${this.USER_COL.name},
        ${this.USER_COL.email},
        ${this.USER_COL.username},
        ${this.USER_COL.password},
        ${this.USER_COL.sponsorId},
        ${this.USER_COL.refcode}
      ) values(?,?,?,?,?,?);`;
    return query(sql, value);
  }

  async findUserById(id: number): Promise<User> {
    const sql = `SELECT * FROM ${this.USER_TABLE} WHERE ${this.USER_COL.id} = ?;`;
    const users: User[] = await query(sql, id);
    if (users.length === 0) return undefined;
    return users[0];
  }

  async findUserByUsername(username: string): Promise<User> {
    const sql = `SELECT * FROM ${this.USER_TABLE} WHERE ${this.USER_COL.username} = ?;`;
    const users: User[] = await query(sql, username);
    if (users.length === 0) return undefined;
    return users[0];
  }

  async findUserByRefcode(refcode: string): Promise<User> {
    const sql = `SELECT * FROM ${this.USER_TABLE} WHERE ${this.USER_COL.refcode} = ?;`;
    const users: User[] = await query(sql, refcode);
    if (users.length === 0) return undefined;
    return users[0];
  }

  async findUserByEmailOrUsername(email, username): Promise<User> {
    if (email === "") email = undefined;
    const sql = `
      SELECT * FROM ${this.USER_TABLE}
      WHERE
        ${this.USER_COL.email} = ? OR
        ${this.USER_COL.username} = ?;`;
    const users: User[] = await query(sql, [email, username]);
    if (users.length === 0) return undefined;
    return users[0];
  }

  async getRefcode(username: string): Promise<string> {
    const sql = `SELECT ${this.USER_COL.refcode} FROM ${this.USER_TABLE} WHERE ${this.USER_COL.username} = ?;`;
    const user: User[] = await query(sql, username);
    if (user.length === 0) return undefined;
    return user[0].refcode;
  }

  setRefcode(username: string, refcode: string) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.refcode} = ?
      WHERE ${this.USER_COL.username} = ? LIMIT 1;`;
    return query(sql, [refcode, username]);
  }

  // Find user information by user id user_info includes user name, avatar, last login time, status, etc. excluding password
  async getUserInfoById(userId: number): Promise<User> {
    const sql =
      `SELECT
        ${this.USER_COL.id} AS userId,
        ${this.USER_COL.username},
        ${this.USER_COL.name},
        ${this.USER_COL.avatar},
        ${this.USER_COL.intro},
        ${this.USER_COL.role}
      FROM ${this.USER_TABLE}
      WHERE ${this.USER_COL.id} = ?;`;
    const user: User[] = await query(sql, userId);
    if (user.length === 0) return undefined;
    return user[0];
  }

  async getUserInfoByUsername(username: string): Promise<User> {
    const sql =
      `SELECT
        ${this.USER_COL.id} AS userId,
        ${this.USER_COL.username},
        ${this.USER_COL.name},
        ${this.USER_COL.avatar},
        ${this.USER_COL.intro},
        ${this.USER_COL.role}
      FROM ${this.USER_TABLE}
      WHERE ${this.USER_COL.username} = ?;`;
    const user: User[] = await query(sql, username);
    if (user.length === 0) return undefined;
    return user[0];
  }

  setUserInfo(username, { name, intro, avatar }) {
    if (isNullOrUndefined(avatar)) {
      const sql = "UPDATE user_info SET name = ?, intro = ? WHERE username = ? limit 1 ; ";
      return query(sql, [name, intro, username]);
    } else {
      const sql = "UPDATE user_info SET name = ?, intro = ?, avatar = ? WHERE username = ? limit 1 ; ";
      return query(sql, [name, intro, avatar, username]);
    }
  }

  setAvatar(username, avatar) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.avatar} = ?
      WHERE ${this.USER_COL.username} = ? LIMIT 1;`;
    return query(sql, [avatar, username]);
  }

  setWalletAddress(username: string, walletAddress: string) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.walletAddress} = ?
      WHERE ${this.USER_COL.username} = ? LIMIT 1;`;
    return query(sql, [walletAddress, username]);
  }

  async findUsersByRole(role: string): Promise<User[]> {
    const sql = `SELECT * FROM ${this.USER_TABLE} WHERE ${this.USER_COL.role} = ?;`;
    const users: User[] = await query(sql, role);
    return users;
  }

  updateRole(username, role) {
    const sql = "UPDATE user_info SET role = ? WHERE username = ? limit 1 ; ";
    return query(sql, [role, username]);
  }

  getUsers({ start, count, name, username, role, email, searchString }) {
    if (role === undefined) role = "";
    if (name === undefined) name = "";
    if (username === undefined) username = "";
    if (email === undefined) email = "";
    if (searchString === undefined) searchString = "";
    const sql = `
      SELECT *, COUNT(*) OVER() as totalCount FROM user_info
      WHERE
        (role LIKE '%${role}%' AND
        username LIKE '%${username}%' AND
        name LIKE '%${name}%' AND
        email LIKE '%${email}%') AND
        (role LIKE '%${searchString}%' OR
        username LIKE '%${searchString}%' OR
        name LIKE '%${searchString}%' OR
        email LIKE '%${searchString}%')
      LIMIT ${start}, ${count};`;
    return query(sql);
  }

  getUsernamelist() {
    const sql = `
      SELECT ${this.USER_COL.username}, ${this.USER_COL.email}
      FROM ${this.USER_TABLE}
      WHERE
        ${this.USER_COL.role} = ? OR
        ${this.USER_COL.role} = ?;`;
    return query(sql, [User.ROLE.FREE, User.ROLE.UPGRADED_USER]);
  }

  async getModers(): Promise<User[]> {
    const sql = `SELECT * FROM ${this.USER_TABLE} WHERE ${this.USER_COL.role} = ?;`;
    const users: User[] = await query(sql, User.ROLE.MODERATOR);
    return users;
  }

  // Check if the user id is a friend of the local user by checking the user id. If yes, return userId and remark.
  async isFriend(userId, fromUser): Promise<boolean> {
    const sql = `
      SELECT * FROM ${this.USER_REL_TABLE}
      WHERE
        ${this.USER_REL_COL.userId} = ? AND
        ${this.USER_REL_COL.fromUser} = ?;`;
    const relation: UserRelation[] = await query(sql, [userId, fromUser]);
    return relation.length !== 0;
  }

  // Add each other as friends
  addFriendEachOther(userId, fromUser, time) {
    const sql = `
      INSERT INTO ${this.USER_REL_TABLE}(
        ${this.USER_REL_COL.userId},
        ${this.USER_REL_COL.fromUser},
        ${this.USER_REL_COL.time}
      ) VALUES (?,?,?), (?,?,?);`;
    return query(sql, [userId, fromUser, time, fromUser, userId, time]);
  }

  banUserFromRainGroup(userId: number) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.ban} = ?
      WHERE ${this.USER_COL.id} = ?;`;
    return query(sql, [User.BAN.BANNED, userId]);
  }

  unbanUsersFromRainGroup(userIds: number[]) {
    if (userIds.length === 0) return undefined;
    const array = getInArraySQL(userIds);
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.ban} = ?
      WHERE ${this.USER_COL.id} IN (${array});`;
    return query(sql, [User.BAN.NONE]);
  }

  async getUsersByRainBanned(): Promise<{
    id: number,
    username: string,
    ban: number,
    time: number
  }[]> {
    const sql = `
      SELECT
        user.${this.USER_COL.id},
        user.${this.USER_COL.username},
        user.${this.USER_COL.ban},
        ban.time
      FROM ${this.USER_TABLE} as user
      INNER JOIN contact_ban_info as ban
      ON user.id = ban.userId
      WHERE user.${this.USER_COL.ban} = ?
      ORDER BY ban.time DESC LIMIT 1;`;
    return query(sql, User.BAN.BANNED);
  }

  // Delete contact
  deleteContact(userId, fromUser) {
    const sql = `
      DELETE FROM ${this.USER_REL_TABLE}
      WHERE
        (${this.USER_REL_COL.userId} = ? AND ${this.USER_REL_COL.fromUser} = ?) OR
        (${this.USER_REL_COL.userId} = ? AND ${this.USER_REL_COL.fromUser} = ?);`;
    return query(sql, [userId, fromUser, fromUser, userId]);
  }

  // Find home page group list by userId
  // TODO: Optimize SQL statement
  getGroupList(userId) {
    const sql = `
    ( SELECT r.groupId ,i.name , i.createTime,
      (SELECT g.message  FROM group_msg AS g  WHERE g.groupId = r.groupId  ORDER BY TIME DESC   LIMIT 1 )  AS message ,
      (SELECT g.time  FROM group_msg AS g  WHERE g.groupId = r.groupId  ORDER BY TIME DESC   LIMIT 1 )  AS time,
      (SELECT g.attachments FROM group_msg AS g  WHERE g.groupId = r.groupId  ORDER BY TIME DESC   LIMIT 1 )  AS attachments
      FROM  group_user_relation AS r inner join group_info AS i on r.groupId = i.groupId WHERE r.userId = ? AND r.groupId != ? )
    UNION
    ( SELECT i.groupId ,i.name , i.createTime, g.message, g.time, g.attachments
      FROM  group_info AS i INNER JOIN rain_group_msg as g on i.groupId = ? ORDER BY TIME DESC LIMIT 1 );`;
    return query(sql, [userId, configs.rain.group_id, configs.rain.group_id]);
  }

  // Find homepage private chat list by userId
  // TODO: Optimize SQL statement
  getPrivateList(userId) {
    const sql = `SELECT r.fromUser as userId, i.username, i.name, i.avatar, r.time as friendtime,
      (SELECT p.message FROM private_msg AS p WHERE (p.toUser = r.fromUser and p.fromUser = r.userId) or (p.fromUser = r.fromUser and p.toUser = r.userId) ORDER BY p.time DESC   LIMIT 1 )  AS message ,
      (SELECT p.time FROM private_msg AS p WHERE (p.toUser = r.fromUser and p.fromUser = r.userId) or (p.fromUser = r.fromUser and p.toUser = r.userId) ORDER BY p.time DESC   LIMIT 1 )  AS time,
      (SELECT p.attachments FROM private_msg AS p WHERE (p.toUser = r.fromUser and p.fromUser = r.userId) or (p.fromUser = r.fromUser and p.toUser = r.userId) ORDER BY p.time DESC   LIMIT 1 )  AS attachments
      FROM  user_user_relation AS r inner join user_info AS i on r.fromUser  = i.id WHERE r.userId = ? ;`;
    return query(sql, userId);
  }

  clearAllSocketIds() {
    const sql = `UPDATE ${this.USER_TABLE} SET socketid = '';`;
    return query(sql);
  }

  saveUserSocketId(userId, socketId) {
    const data = [socketId, userId];
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.socketId} = ?
      WHERE ${this.USER_COL.id} = ? LIMIT 1;`;
    return query(sql, data);
  }

  async getSocketid(userId: number): Promise<string[]> {
    const sql = `
      SELECT ${this.USER_COL.socketId}
      FROM ${this.USER_TABLE}
      WHERE ${this.USER_COL.id} = ? LIMIT 1;`;
    const users: User[] = await query(sql, userId);
    if (users.length === 0) return [];
    return users[0].socketid.split(",");
  }

  async getUserBySocketId(socketId): Promise<User> {
    if (socketId === "") socketId = undefined;
    const sql = `
      SELECT * FROM ${this.USER_TABLE}
      WHERE ${this.USER_COL.socketId} LIKE '%${socketId}%' LIMIT 1;`;
    const users: User[] = await query(sql);
    if (users.length === 0) return undefined;
    return users[0];
  }

  async getUsersByPopLimited(): Promise<User[]> {
    const limit = configs.rain.pop_rain_balance_limit;
    const sql = `SELECT * FROM ${this.USER_TABLE} WHERE ${this.USER_COL.popBalance} >= ?;`;
    const users: User[] = await query(sql, limit);
    return users;
  }

  getUsersByLastActivity(limit) {
    const sql = `
    SELECT u.id, u.socketid
    FROM rain_group_msg as rgm
    JOIN user_info as u
    ON rgm.fromUser = u.id
    ORDER BY rgm.time DESC LIMIT ?;`;
    return query(sql, limit);
  }

  getUsersByUserIds(userIds: number[]) {
    const array = getInArraySQL(userIds);
    const sql = `SELECT * FROM ${this.USER_TABLE} WHERE ${this.USER_COL.id} IN (${array});`;
    return query(sql);
  }

  getUsersByUsernames(usernames: string[]) {
    const array = getInArraySQL(usernames);
    const sql = `SELECT * FROM ${this.USER_TABLE} WHERE ${this.USER_COL.username} IN (${array});`;
    return query(sql);
  }

  resetPopbalance(userIds: number[]) {
    const array = getInArraySQL(userIds);
    const sql = `UPDATE user_info SET popBalance = 0 WHERE id IN (${array})`;
    return query(sql, userIds);
  }

  rainUser(username, reward) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET
        balance = balance + ?,
        popBalance = popBalance + ?
      WHERE username = ?;`;
    return query(sql, [reward / 2, reward / 2, username]);
  }

  rainUsers(userIds: number[], reward, popReward) {
    const array = getInArraySQL(userIds);
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET
        balance = balance + ?,
        popBalance = popBalance + ?
      WHERE id IN (${array});`;
    return query(sql, [reward, popReward]);
  }

  // Membership Revenue
  resetBalance(userId: number) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.balance} = ?
      WHERE ${this.USER_COL.id} = ?`;
    return query(sql, [0, userId]);
  }
  addBalance(userId: number, amount: number) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET
        ${this.USER_COL.balance} = ${this.USER_COL.balance} + ?
      WHERE ${this.USER_COL.id} = ?;`;
    return query(sql, [amount, userId]);
  }

  shareRevenue(amount: number, role: string) {
    const sql = `
      UPDATE ${this.USER_TABLE} as a
      INNER JOIN (
        SELECT COUNT(*) OVER() as total
        FROM ${this.USER_TABLE} WHERE ${this.USER_COL.role} = ?
      ) as b
      SET a.${this.USER_COL.balance} = a.${this.USER_COL.balance} + ? / b.total;`;
    return query(sql, [role, amount]);
  }

  setModers(usernames: string[]) {
    const array = getInArraySQL(usernames);
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.role} = ?
      WHERE ${this.USER_COL.username} IN (${array});`;
    return query(sql, User.ROLE.MODERATOR);
  }

  cancelModer(username: string) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.role} = ?
      WHERE ${this.USER_COL.username} = ?;`;
    return query(sql, [User.ROLE.UPGRADED_USER, username]);  // Change Role field to x,y,z format later
  }

  updateMembership(userId, role) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET
        ${this.USER_COL.role} = ?,
        ${this.USER_COL.lastUpgradeTime} = ?
      WHERE ${this.USER_COL.id} = ?;
    `;
    return query(sql, [role, moment().utc().unix(), userId]);
  }

  getUsersByExpired(role, expireTime) {
    const sql = `
      SELECT * FROM ${this.USER_TABLE}
      WHERE ${this.USER_COL.role} = ? AND ${this.USER_COL.lastUpgradeTime} < ?;
    `;
    return query(sql, [role, expireTime]);
  }

  resetExpiredRole(role, expireTime) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.role} = ?
      WHERE ${this.USER_COL.role} = ? AND ${this.USER_COL.lastUpgradeTime} < ?;
    `;
    return query(sql, [User.ROLE.FREE, role, expireTime]);
  }

  resetLastVitaePostTime(userId) {
    const sql = `
      UPDATE ${this.USER_TABLE}
      SET ${this.USER_COL.lastVitaePostTime} = ?
      WHERE ${this.USER_COL.id} = ?`;
    return query(sql, [moment().utc().unix(), userId]);
  }

  // Add as a friend unilaterally (may later add the function of turning on friend verification)
  // const addAsFriend = (userId, fromUser, time) {
  //   const sql = 'INSERT INTO user_user_relation(userId,fromUser,time) VALUES (?,?,?)';
  //   return query(sql, [userId, fromUser, time]);
  // };

  // Block friends
  // const shieldFriend = (status, userId, fromUser) {
  //   const sql = 'UPDATE  user_user_relation  SET shield = ?  WHERE  userId = ? AND fromUser = ? ';
  //   return query(sql, [status, userId, fromUser]);
  // };

  // // Modify notes
  // const editorRemark = (remark, userId, fromUser) {
  //   const sql = 'UPDATE  user_user_relation  SET remark = ?  WHERE  userId = ? AND fromUser = ? ';
  //   return query(sql, [remark, userId, fromUser]);
  // };

  // Find user information by user name user_info does not include password
  // const findUIByName = (name) {
  //   const sql = 'SELECT id ,name,avatar FROM user_info WHERE name = ? ';
  //   return query(sql, name);
  // };

  // Find user information by user id user_info including password
  // const findDataByUserid = (userId) {
  //   const sql = 'SELECT * FROM user_info WHERE id= ? ';
  //   return query(sql, [userid]);
  // };
}
