import * as moment from "moment";
import { query } from "../utils/db";
import { getInArraySQL } from "../utils/utils";
import { Ban } from "../models/ban.model";
import configs from "@configs";

export class BanService {
  readonly TABLE_NAME = "contact_ban_info";
  readonly COLUMNS = {
    id: "id",
    userId: "userId",
    blockerId: "blockerId",
    type: "type",
    time: "time",
  };

  banUserFromGroup(userId: number, groupId: number) {
    const sql = `
      INSERT INTO ${this.TABLE_NAME}(
        ${this.COLUMNS.userId},
        ${this.COLUMNS.blockerId},
        ${this.COLUMNS.type},
        ${this.COLUMNS.time}
      ) VALUES (?,?,?,?);`;
    return query(sql, [userId, groupId, Ban.TYPE.GROUP, moment().utc().unix()]);
  }

  banFriend(userId: number, friendId: number) {
    const sql = `
      INSERT INTO ${this.TABLE_NAME}(
        ${this.COLUMNS.userId},
        ${this.COLUMNS.blockerId},
        ${this.COLUMNS.type},
        ${this.COLUMNS.time}
      ) VALUES (?,?,?,?);`;
    return query(sql, [userId, friendId, Ban.TYPE.DIRECT, moment().utc().unix()]);
  }

  getBanInfo(userId: number, blockerId: string, type: number) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.COLUMNS.userId} = ? AND
        ${this.COLUMNS.blockerId} = ? AND
        ${this.COLUMNS.type} = ?
      ORDER BY ${this.COLUMNS.time} DESC;`;
    return query(sql, [userId, blockerId, type]);
  }

  async getLastBanTime(userId: number, blockerId: string, type: number): Promise<number> {
    const bans: Ban[] = await this.getBanInfo(userId, blockerId, type);
    if (bans.length === 0) return 0;
    else return bans[0].time;
  }

  async numberOfBan(userId: number, blockerId: string, type: number): Promise<number> {
    const banInfo: Ban[] = await this.getBanInfo(userId, blockerId, type);
    return banInfo.length;
  }

  async isBlockedUser(userId: number, friendId: number): Promise<boolean> {
    const banInfo: Ban[] = await this.getBanInfo(userId, friendId.toString(), Ban.TYPE.DIRECT);
    return banInfo.length === 0;
  }

  async isBannedInGroup(userId: number, groupId: string): Promise<boolean> {
    const banInfo: Ban[] = await this.getBanInfo(userId, groupId, Ban.TYPE.GROUP);
    return banInfo.length === 0;
  }

  async isPermBannedInRainGroup(userId: number): Promise<boolean> {
    const banInfo: Ban[] = await this.getBanInfo(userId, configs.rain.group_id, Ban.TYPE.GROUP);
    return banInfo.length === 3;
  }
}