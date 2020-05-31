import { query } from "../utils/db";
import configs from "@configs";

export class AdsService {
  insertAds({ user_id, asset_link, impressions, link, button_name, title, description, time }) {
    const _sql = "insert into ads_info(user_id,asset_link,impressions,link,button_name,title,description,time) values(?,?,?,?,?,?,?,?);";
    return query(_sql, [user_id, asset_link, impressions, link, button_name, title, description, time]);
  }

  findAdsById(ads_id) {
    const _sql = "SELECT * FROM ads_info WHERE id = ?;";
    return query(_sql, ads_id);
  }

  findAdsByUserId(user_id) {
    const _sql = "SELECT * FROM ads_info WHERE user_id = ?;";
    return query(_sql, user_id);
  }
}