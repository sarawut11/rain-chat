import { query } from "@utils";
import { Setting, DefaultModel } from "@models";

export class SettingService {
  public readonly TABLE = "setting_info";
  public readonly COL = {
    key: "key",
    value: "value",
    type: "type",
  };

  async getAllSettings(): Promise<Setting[]> {
    const sql = `SELECT * FROM ${this.TABLE};`;
    const settings: Setting[] = await query(sql);
    return settings;
  }

  async getSetting(key: string): Promise<Setting> {
    const sql = `SELECT * FROM ${this.TABLE} WHERE ${this.COL.key} = ?;`;
    const settings: Setting[] = await query(sql, key);
    if (settings.length === 0) return undefined;
    return settings[0];
  }

  async updateSetting(key: string, value: any): Promise<DefaultModel> {
    const sql = `
      UPDATE ${this.TABLE}
      SET ${this.COL.value} = ?
      WHERE ${this.COL.key} = ?;`;
    const result: DefaultModel = await query(sql, [value.toString(), key]);
    return result;
  }
}