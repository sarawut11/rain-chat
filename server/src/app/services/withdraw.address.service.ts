import * as moment from "moment";
import { query } from "../utils/db";
import { DefaultModel, WithdrawAddress } from "../models";

export class WithdrawAddressService {
  readonly TABLE_NAME = "withdraw_address_info";
  readonly COL = {
    id: "id",
    userId: "userId",
    withdrawAddress: "withdrawAddress",
    label: "label",
    time: "time"
  };

  async addWithdrawAddress(userId: number, withdrawAddress: string, label: string): Promise<DefaultModel> {
    const sql = `
      INSERT INTO ${this.TABLE_NAME}(
        ${this.COL.userId},
        ${this.COL.withdrawAddress},
        ${this.COL.label},
        ${this.COL.time}
      ) VALUES(?,?,?,?);`;
    return query(sql, [userId, withdrawAddress, label, moment().utc().unix()]);
  }

  async getAddressByUserid(userId: number): Promise<WithdrawAddress[]> {
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.COL.userId} = ?;`;
    const addresses: WithdrawAddress[] = await query(sql, userId);
    return addresses;
  }

  async getAddressById(recordId: number): Promise<WithdrawAddress> {
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.COL.id} = ?;`;
    const addresses: WithdrawAddress[] = await query(sql, recordId);
    if (addresses.length === 0) return undefined;
    return addresses[0];
  }

  async deleteAddress(recordId: number, userId: number): Promise<DefaultModel> {
    const sql = `
      DELETE FROM ${this.TABLE_NAME}
      WHERE
        ${this.COL.id} = ? AND
        ${this.COL.userId} = ?;`;
    return query(sql, [recordId, userId]);
  }
}