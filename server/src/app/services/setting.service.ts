import { query } from "@utils";
import { DefaultModel, Setting, AllSetting } from "@models";

export class SettingService {
  public readonly TABLE = "setting_info";
  public readonly COL = {
    name: "name",
    value: "value",
    type: "type",
  };

  async getAllSettings(): Promise<AllSetting> {
    const sql = `SELECT * FROM ${this.TABLE};`;
    const settings: Setting[] = await query(sql);
    const allSettings: AllSetting = new AllSetting();
    settings.forEach(setting => {
      if (setting.type === Setting.TYPE.DOUBLE || setting.type === Setting.TYPE.INT)
        allSettings[setting.name] = Number(setting.value);
      else
        allSettings[setting.name] = setting.value;
    });
    return allSettings;
  }

  async getSetting(key: string): Promise<Setting> {
    const sql = `SELECT * FROM ${this.TABLE} WHERE ${this.COL.name} = ?;`;
    const settings: Setting[] = await query(sql, key);
    if (settings.length === 0) return undefined;
    return settings[0];
  }

  async getSettingValue(key: string): Promise<any> {
    const sql = `SELECT * FROM ${this.TABLE} WHERE ${this.COL.name} = ?;`;
    const settings: Setting[] = await query(sql, key);
    if (settings.length === 0) return undefined;
    if (settings[0].type === Setting.TYPE.DOUBLE || settings[0].type === Setting.TYPE.INT) {
      return Number(settings[0].value);
    } else {
      return settings[0].value;
    }
  }

  async updateSetting(key: string, value: any): Promise<DefaultModel> {
    const sql = `
      UPDATE ${this.TABLE}
      SET ${this.COL.value} = ?
      WHERE ${this.COL.name} = ?;`;
    const result: DefaultModel = await query(sql, [value.toString(), key]);
    return result;
  }
}