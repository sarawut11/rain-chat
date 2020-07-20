import { query } from "@utils";

export class ChatService {

  getPrivateDetail(fromUser, toUser, start, count) {
    const data = [fromUser, toUser, toUser, fromUser, start, count];
    const sql = `
      SELECT * FROM (
        SELECT p.fromUser,p.toUser,p.message,p.attachments,p.time,i.avatar,i.name
        FROM private_msg AS p INNER JOIN user_info as i ON p.fromUser = i.id
        WHERE
          (p.fromUser = ? AND p.toUser   = ? ) OR (p.fromUser = ? AND p.toUser = ? )
        ORDER BY time DESC LIMIT ?,?)
      as n order by n.time`;
    return query(sql, data);
  }

  savePrivateMsg({ fromUser, toUser, message, time, attachments }) {
    const data = [fromUser, toUser, message, time, attachments];
    const sql =
      " INSERT INTO private_msg(fromUser,toUser,message,time,attachments)  VALUES(?,?,?,?,?); ";
    return query(sql, data);
  }

  getUnreadCount({ sortTime, fromUser, toUser }) {
    const data = [sortTime, fromUser, toUser, toUser, fromUser];
    const sql = `
      SELECT count(time) as unread
      FROM private_msg AS p
      WHERE
        p.time > ? AND
        ((p.fromUser = ? and p.toUser= ?) or (p.fromUser = ? and p.toUser=?));`;
    return query(sql, data);
  }
}
