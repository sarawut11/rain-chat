import * as moment from "moment";
import { query } from "../utils/db";
import { getInArraySQL } from "../utils/utils";
import { isNullOrUndefined } from "util";
import configs from "@configs";
import { User } from "../models";

export class UserService {
  readonly TABLE_NAME = "user_info";
  readonly columns = {
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

  constructor() {
    // Clear All User's socketId
    this.clearAllSocketIds();
  }

  // Fuzzy matching users
  fuzzyMatchUsers(username) {
    const sql = "SELECT * FROM user_info WHERE username LIKE ?;";
    return query(sql, username);
  }

  // Register User
  insertUser(value) {
    const sql = "insert into user_info(name,email,username,password,sponsor,refcode) values(?,?,?,?,?,?);";
    return query(sql, value);
  }

  findUserById(id) {
    const sql = "SELECT * FROM user_info WHERE id = ?;";
    return query(sql, id);
  }

  findUserByUsername(username) {
    const sql = "SELECT * FROM user_info WHERE username = ?;";
    return query(sql, username);
  }

  findUserByEmail(email) {
    const sql = "SELECT * FROM user_info WHERE email = ?;";
    return query(sql, email);
  }

  findUserByRefcode(refcode) {
    const sql = "SELECT * FROM user_info WHERE refcode = ?;";
    return query(sql, refcode);
  }

  findUserByEmailOrUsername(email, username) {
    if (email === "") email = undefined;
    const sql = "SELECT * FROM user_info WHERE email = ? OR username = ?;";
    return query(sql, [email, username]);
  }

  getRefcode(username) {
    const sql = "SELECT refcode FROM user_info WHERE username = ?;";
    return query(sql, username);
  }

  setRefcode(username, refcode) {
    const sql = "UPDATE user_info SET refcode = ? WHERE username = ? limit 1 ; ";
    return query(sql, [refcode, username]);
  }

  // Find user information by user id user_info includes user name, avatar, last login time, status, etc. excluding password
  getUserInfoById(userId) {
    const sql =
      "SELECT id AS userId, username, name, avatar, intro, role FROM user_info WHERE user_info.id =? ";
    return query(sql, [userId]);
  }

  getUserInfoByUsername(username) {
    const sql =
      "SELECT id AS userId, username, name, avatar, intro, role FROM user_info WHERE user_info.username =? ";
    return query(sql, [username]);
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
    const sql = "UPDATE user_info SET avatar = ? WHERE username = ? limit 1 ; ";
    return query(sql, [avatar, username]);
  }

  findUsersByRole(role: string) {
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.columns.role} = ?;`;
    return query(sql, role);
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
      SELECT ${this.columns.username}, ${this.columns.email}
      FROM ${this.TABLE_NAME}
      WHERE
        ${this.columns.role} = ? OR
        ${this.columns.role} = ?;`;
    return query(sql, [User.ROLE.FREE, User.ROLE.UPGRADED_USER]);
  }

  getModers() {
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.columns.role} = ?;`;
    return query(sql, User.ROLE.MODERATOR);
  }

  // Check if the user id is a friend of the local user by checking the user id. If yes, return userId and remark.
  isFriend(userId, fromUser) {
    const sql =
      "SELECT * FROM user_user_relation AS u WHERE u.userId = ? AND u.fromUser = ? ";
    return query(sql, [userId, fromUser]);
  }

  // Add each other as friends
  addFriendEachOther(userId, fromUser, time) {
    const sql = "INSERT INTO user_user_relation(userId,fromUser,time) VALUES (?,?,?), (?,?,?)";
    return query(sql, [userId, fromUser, time, fromUser, userId, time]);
  }

  banUserFromRainGroup(userId: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET ${this.columns.ban} = ?
      WHERE ${this.columns.id} = ?;`;
    return query(sql, [User.BAN.BANNED, userId]);
  }

  unbanUsersFromRainGroup(userIds: number[]) {
    const array = getInArraySQL(userIds);
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET ${this.columns.ban} = ?
      WHERE ${this.columns.id} IN (${array});`;
    return query(sql, [User.BAN.NONE]);
  }

  getUsersByRainBanned() {
    const sql = `
      SELECT
        user.${this.columns.id},
        user.${this.columns.username},
        user.${this.columns.ban}
        ban.time
      FROM ${this.TABLE_NAME} as user
      INNER JOIN contact_ban_info as ban
      ON user.id = ban.userId
      WHERE ${this.columns.ban} = ?
      ORDER BY ban.time DESC LIMIT 1;`;
    return query(sql, User.BAN.BANNED);
  }

  // Delete contact
  deleteContact(userId, fromUser) {
    const sql =
      "DELETE FROM  user_user_relation WHERE (userId = ? AND fromUser = ?) or (userId = ? AND fromUser = ?)";
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
    const sql = `
      UPDATE ${this.TABLE_NAME} SET socketid = '';
    `;
    return query(sql);
  }

  saveUserSocketId(userId, socketId) {
    const data = [socketId, userId];
    const sql = "UPDATE user_info SET socketid = ? WHERE id= ? limit 1 ; ";
    return query(sql, data);
  }

  getSocketIdsByUserids(userIds: string[]) {
    if (userIds.length === 0) {
      return [];
    }
    const array = getInArraySQL(userIds);
    const sql = `SELECT socketid FROM user_info WHERE id IN (${array})`;
    return query(sql);
  }

  getSocketid(toUserId) {
    const sql = "SELECT socketid FROM user_info WHERE id=? limit 1 ;";
    return query(sql, [toUserId]);
  }

  getUserBySocketId(socketId) {
    if (socketId === "") socketId = undefined;
    const sql = `SELECT * FROM user_info WHERE socketid LIKE '%${socketId}%' limit 1;`;
    return query(sql);
  }

  getUsersByPopLimited() {
    const limit = configs.rain.pop_rain_balance_limit;
    const sql = "SELECT * FROM user_info WHERE popBalance >= ?;";
    return query(sql, limit);
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
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.columns.id} IN (${array});`;
    return query(sql);
  }

  getUsersByUsernames(usernames: string[]) {
    const array = getInArraySQL(usernames);
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.columns.username} IN (${array});`;
    return query(sql);
  }

  resetPopbalance(userIds: number[]) {
    const array = getInArraySQL(userIds);
    const sql = `UPDATE user_info SET popBalance = 0 WHERE id IN (${array})`;
    return query(sql, userIds);
  }

  rainUser(username, reward) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        balance = balance + ?,
        popBalance = popBalance + ?
      WHERE username = ?;`;
    return query(sql, [reward / 2, reward / 2, username]);
  }

  rainUsers(userIds: number[], reward, popReward) {
    const array = getInArraySQL(userIds);
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        balance = balance + ?,
        popBalance = popBalance + ?
      WHERE id IN (${array});`;
    return query(sql, [reward, popReward]);
  }

  // Membership Revenue
  addBalance(userId: number, amount: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.columns.balance} = ${this.columns.balance} + ?
      WHERE ${this.columns.id} = ?;`;
    return query(sql, [amount, userId]);
  }

  shareRevenue(amount: number, role: string) {
    const sql = `
      UPDATE ${this.TABLE_NAME} as a
      INNER JOIN (
        SELECT COUNT(*) OVER() as total
        FROM ${this.TABLE_NAME} WHERE ${this.columns.role} = ?
      ) as b
      SET a.${this.columns.balance} = a.${this.columns.balance} + ? / b.total;`;
    return query(sql, [role, amount]);
  }

  setModers(usernames: string[]) {
    const array = getInArraySQL(usernames);
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET ${this.columns.role} = ?
      WHERE ${this.columns.username} IN (${array});`;
    return query(sql, User.ROLE.MODERATOR);
  }

  cancelModer(username: string) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET ${this.columns.role} = ?
      WHERE ${this.columns.username} = ?;`;
    return query(sql, [User.ROLE.UPGRADED_USER, username]);  // Change Role field to x,y,z format later
  }

  updateMembership(userId, role) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.columns.role} = ?,
        ${this.columns.lastUpgradeTime} = ?
      WHERE ${this.columns.id} = ?;
    `;
    return query(sql, [role, moment().utc().unix(), userId]);
  }

  getUsersByExpired(role, expireTime) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE ${this.columns.role} = ? AND ${this.columns.lastUpgradeTime} < ?;
    `;
    return query(sql, [role, expireTime]);
  }

  resetExpiredRole(role, expireTime) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET ${this.columns.role} = ?
      WHERE ${this.columns.role} = ? AND ${this.columns.lastUpgradeTime} < ?;
    `;
    return query(sql, [User.ROLE.FREE, role, expireTime]);
  }

  resetLastVitaePostTime(userId) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET ${this.columns.lastVitaePostTime} = ?
      WHERE ${this.columns.id} = ?`;
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
