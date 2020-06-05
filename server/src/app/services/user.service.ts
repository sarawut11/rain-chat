import { query } from "../utils/db";
import configs from "@configs";
import { isNullOrUndefined } from "util";

export class UserService {

  public static readonly Role = {
    OWNER: "OWNER",
    MODERATOR: "MODERATOR",
    FREE: "FREE",
    UPGRADED_USER: "UPGRADED",
  };

  // Fuzzy matching users
  fuzzyMatchUsers(link) {
    const _sql = "SELECT * FROM user_info WHERE username LIKE ?;";
    return query(_sql, link);
  }

  // Register User
  insertUser(value) {
    const _sql = "insert into user_info(name,email,username,password,sponsor,refcode) values(?,?,?,?,?,?);";
    return query(_sql, value);
  }

  findUserById(id) {
    const _sql = "SELECT * FROM user_info WHERE id = ?;";
    return query(_sql, id);
  }

  findUserByUsername(username) {
    const _sql = "SELECT * FROM user_info WHERE username = ?;";
    return query(_sql, username);
  }

  findUserByEmail(email) {
    const _sql = "SELECT * FROM user_info WHERE email = ?;";
    return query(_sql, email);
  }

  findUserByRefcode(refcode) {
    const _sql = "SELECT * FROM user_info WHERE refcode = ?;";
    return query(_sql, refcode);
  }

  findUserByEmailOrUsername(email, username) {
    const _sql = "SELECT * FROM user_info WHERE email = ? OR username = ?;";
    return query(_sql, [email, username]);
  }

  getRefcode(username) {
    const _sql = "SELECT refcode FROM user_info WHERE username = ?;";
    return query(_sql, username);
  }

  setRefcode(username, refcode) {
    const _sql = "UPDATE user_info SET refcode = ? WHERE username = ? limit 1 ; ";
    return query(_sql, [refcode, username]);
  }

  // Find user information by user id user_info includes user name, avatar, last login time, status, etc. excluding password
  getUserInfoById(user_id) {
    const _sql =
      "SELECT id AS user_id, username, name, avatar, intro FROM user_info WHERE user_info.id =? ";
    return query(_sql, [user_id]);
  }

  getUserInfoByUsername(username) {
    const _sql =
      "SELECT id AS user_id, username, name, avatar, intro FROM user_info WHERE user_info.username =? ";
    return query(_sql, [username]);
  }

  setUserInfo(username, { name, intro, avatar }) {
    if (isNullOrUndefined(avatar)) {
      const _sql = "UPDATE user_info SET name = ?, intro = ? WHERE username = ? limit 1 ; ";
      return query(_sql, [name, intro, username]);
    } else {
      const _sql = "UPDATE user_info SET name = ?, intro = ?, avatar = ? WHERE username = ? limit 1 ; ";
      return query(_sql, [name, intro, avatar, username]);
    }
  }

  setAvatar(username, avatar) {
    const _sql = "UPDATE user_info SET avatar = ? WHERE username = ? limit 1 ; ";
    return query(_sql, [avatar, username]);
  }

  updateRole(username, role) {
    const _sql = "UPDATE user_info SET role = ? WHERE username = ? limit 1 ; ";
    return query(_sql, [role, username]);
  }

  // Check if the user id is a friend of the local user by checking the user id. If yes, return user_id and remark.
  isFriend(user_id, from_user) {
    const _sql =
      "SELECT * FROM user_user_relation AS u WHERE u.user_id = ? AND u.from_user = ? ";
    return query(_sql, [user_id, from_user]);
  }

  // Add each other as friends
  addFriendEachOther(user_id, from_user, time) {
    const _sql = "INSERT INTO user_user_relation(user_id,from_user,time) VALUES (?,?,?), (?,?,?)";
    return query(_sql, [user_id, from_user, time, from_user, user_id, time]);
  }

  // Delete contact
  deleteContact(user_id, from_user) {
    const _sql =
      "DELETE FROM  user_user_relation WHERE (user_id = ? AND from_user = ?) or (user_id = ? AND from_user = ?)";
    return query(_sql, [user_id, from_user, from_user, user_id]);
  }

  // Find home page group list by user_id
  // TODO: Optimize SQL statement
  getGroupList(user_id) {
    const _sql = `
    ( SELECT r.to_group_id ,i.name , i.create_time,
      (SELECT g.message  FROM group_msg AS g  WHERE g.to_group_id = r.to_group_id  ORDER BY TIME DESC   LIMIT 1 )  AS message ,
      (SELECT g.time  FROM group_msg AS g  WHERE g.to_group_id = r.to_group_id  ORDER BY TIME DESC   LIMIT 1 )  AS time,
      (SELECT g.attachments FROM group_msg AS g  WHERE g.to_group_id = r.to_group_id  ORDER BY TIME DESC   LIMIT 1 )  AS attachments
      FROM  group_user_relation AS r inner join group_info AS i on r.to_group_id = i.to_group_id WHERE r.user_id = ? AND r.to_group_id != ? )
    UNION
    ( SELECT i.to_group_id ,i.name , i.create_time, g.message, g.time, g.attachments
      FROM  group_info AS i INNER JOIN rain_group_msg as g on i.to_group_id = ? ORDER BY TIME DESC LIMIT 1 );`;
    return query(_sql, [user_id, configs.rain.group_id, configs.rain.group_id]);
  }

  // Find homepage private chat list by user_id
  // TODO: Optimize SQL statement
  getPrivateList(user_id) {
    const _sql = ` SELECT r.from_user as user_id, i.username, i.name, i.avatar, r.time as be_friend_time,
      (SELECT p.message FROM private_msg AS p WHERE (p.to_user = r.from_user and p.from_user = r.user_id) or (p.from_user = r.from_user and p.to_user = r.user_id) ORDER BY p.time DESC   LIMIT 1 )  AS message ,
      (SELECT p.time FROM private_msg AS p WHERE (p.to_user = r.from_user and p.from_user = r.user_id) or (p.from_user = r.from_user and p.to_user = r.user_id) ORDER BY p.time DESC   LIMIT 1 )  AS time,
      (SELECT p.attachments FROM private_msg AS p WHERE (p.to_user = r.from_user and p.from_user = r.user_id) or (p.from_user = r.from_user and p.to_user = r.user_id) ORDER BY p.time DESC   LIMIT 1 )  AS attachments
      FROM  user_user_relation AS r inner join user_info AS i on r.from_user  = i.id WHERE r.user_id = ? ;`;
    return query(_sql, user_id);
  }

  saveUserSocketId(user_id, socketId) {
    const data = [socketId, user_id];
    const _sql = "UPDATE user_info SET socketid = ? WHERE id= ? limit 1 ; ";
    return query(_sql, data);
  }

  getUserSocketId(toUserId) {
    const _sql = "SELECT socketid FROM user_info WHERE id=? limit 1 ;";
    return query(_sql, [toUserId]);
  }

  getUserBySocketId(socketId) {
    const _sql = "SELECT * FROM user_info WHERE socketid LIKE ? limit 1;";
    return query(_sql, socketId);
  }

  getUsersByPopLimited() {
    const limit = configs.rain.pop_rain_balance_limit;
    const _sql = "SELECT * FROM user_info WHERE pop_balance >= ?;";
    return query(_sql, limit);
  }

  getUsersByLastActivity(limit) {
    const _sql = `
    SELECT u.id as user_id, u.socketid
    FROM rain_group_msg as rgm
    JOIN user_info as u
    ON rgm.from_user = u.id
    ORDER BY rgm.time DESC LIMIT ?;`;
    return query(_sql, limit);
  }

  resetPopbalance(userIds: String[]) {
    let array = "";
    userIds.forEach(id => array += "?,");
    array = array.substring(0, array.length - 1);
    const _sql = `UPDATE user_info SET pop_balance = 0 WHERE id IN (${array})`;
    return query(_sql, userIds);
  }

  rainUser(username, reward) {
    const _sql = "UPDATE user_info SET balance = balance + ?, pop_balance = pop_balance + ? WHERE username = ?;";
    return query(_sql, [reward / 2, reward / 2, username]);
  }

  rainUsersBySocketId(socketIds, reward, pop_reward) {
    let _sql = "";
    const params = [];
    socketIds.forEach(socketId => {
      _sql += "UPDATE user_info SET balance = balance + ?, pop_balance = pop_balance + ? WHERE socketid LIKE ?;";
      params.push(reward, pop_reward, socketId);
    });
    return query(_sql, params);
  }

  // Add as a friend unilaterally (may later add the function of turning on friend verification)
  // const addAsFriend = (user_id, from_user, time) {
  //   const _sql = 'INSERT INTO user_user_relation(user_id,from_user,time) VALUES (?,?,?)';
  //   return query(_sql, [user_id, from_user, time]);
  // };

  // Block friends
  // const shieldFriend = (status, user_id, from_user) {
  //   const _sql = 'UPDATE  user_user_relation  SET shield = ?  WHERE  user_id = ? AND from_user = ? ';
  //   return query(_sql, [status, user_id, from_user]);
  // };

  // // Modify notes
  // const editorRemark = (remark, user_id, from_user) {
  //   const _sql = 'UPDATE  user_user_relation  SET remark = ?  WHERE  user_id = ? AND from_user = ? ';
  //   return query(_sql, [remark, user_id, from_user]);
  // };

  // Find user information by user name user_info does not include password
  // const findUIByName = (name) {
  //   const _sql = 'SELECT id ,name,avatar FROM user_info WHERE name = ? ';
  //   return query(_sql, name);
  // };

  // Find user information by user id user_info including password
  // const findDataByUserid = (user_id) {
  //   const _sql = 'SELECT * FROM user_info WHERE id= ? ';
  //   return query(_sql, [userid]);
  // };
}
