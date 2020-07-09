import { query } from "../utils/db";
import * as moment from "moment";
import { Otp } from "../models";

export class OtpService {
  readonly OTP_TABLE = "otp_info";
  readonly COL = {
    id: "id",
    userId: "userId",
    code: "code",
    type: "type",
    time: "time"
  };

  async setOtp(userId: number, code: string, type: number) {
    const existingOtp: Otp = await this.getOtp(userId, type);
    if (existingOtp === undefined) {
      const sql = `
        INSERT INTO ${this.OTP_TABLE}
        SET
          ${this.COL.userId} = ?,
          ${this.COL.code} = ?,
          ${this.COL.type} = ?,
          ${this.COL.time} = ?;`;
      return query(sql, [userId, code, type, moment().utc().unix()]);
    } else {
      const sql = `
        UPDATE ${this.OTP_TABLE}
        SET
          ${this.COL.code} = ?,
          ${this.COL.time} = ?
        WHERE ${this.COL.id} = ?;`;
      return query(sql, [code, moment().utc().unix(), existingOtp.id]);
    }
  }

  async getOtp(userId: number, type: number): Promise<Otp> {
    const sql = `
      SELECT * FROM ${this.OTP_TABLE}
      WHERE
        ${this.COL.userId} = ? AND
        ${this.COL.type} = ?;`;
    const otps: Otp[] = await query(sql, [userId, type]);
    if (otps.length === 0) return undefined;
    return otps[0];
  }
}