import { query, now } from "@utils";
import { CostPerImp, DefaultModel } from "@models";

export class ImpcostService {
  public readonly TABLE = "cost_per_imp_info";
  public readonly COL = {
    userId: "userId",
    price: "price",
    time: "time"
  };

  async savePrice(userId: number, price: number): Promise<DefaultModel> {
    const savedPrice = await this.getPrice(userId);
    if (savedPrice === undefined) {
      const sql = `
        INSERT INTO ${this.TABLE}
        SET
          ${this.COL.userId} = ?,
          ${this.COL.price} = ?,
          ${this.COL.time} = ?;`;
      return query(sql, [userId, price, now()]);
    } else {
      const sql = `
        UPDATE ${this.TABLE}
        SET
          ${this.COL.price} = ?,
          ${this.COL.time} = ?
        WHERE ${this.COL.userId} = ?;`;
      return query(sql, [price, now(), userId]);
    }
  }

  async getPrice(userId: number): Promise<CostPerImp> {
    const sql = `SELECT * FROM ${this.TABLE} WHERE ${this.COL.userId} = ?;`;
    const prices: CostPerImp[] = await query(sql, userId);
    if (prices.length === 0) return undefined;
    return prices[0];
  }
}