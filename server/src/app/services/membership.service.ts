import { query } from "../utils/db";
import configs from "@configs";
import * as moment from "moment";

export class MembershipService {
  public static readonly STATUS = {
    FREE: "FREE",
    PENDING: "PENDING",
    UPGRADED: "UPGRADED",
  };
  readonly TABLE_NAME = "membership_info";

  getMembershipInfoById(userId) {
    const _sql = `SELECT * FROM ${this.TABLE_NAME} WHERE user_id = ? SORT BY time DESC LIMIT 1;`;
    return query(_sql, userId);
  }

  insertMembershipInfo(userId) {
    const _sql = `INSERT INTO ${this.TABLE_NAME}(user_id, status, time) values(?,?,?);`;
    return query(_sql, [userId, MembershipService.STATUS.PENDING, moment().utc().unix()]);
  }

  confirmMembershipInfo(userId) {
    const _sql = `
      UPDATE ${this.TABLE_NAME} SET
        status = ${MembershipService.STATUS.UPGRADED},
        confirm_time = ${moment().utc().unix()}
      WHERE user_id = ? SORT BY time DESC LIMIT 1`;
    return query(_sql, userId);
  }
}