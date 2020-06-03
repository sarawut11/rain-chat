import { query } from "../utils/db";
import configs from "@configs";
import { isNullOrUndefined } from "util";

export class AdsService {
  public AdsStatus = {
    Created: 0,
    Pending: 1,
    Approved: 2,
  };

  insertAds({ user_id, asset_link, link, button_name, title, description, time }) {
    const _sql = "insert into ads_info(user_id,asset_link,link,button_name,title,description,time) values(?,?,?,?,?,?,?);";
    return query(_sql, [user_id, asset_link, link, button_name, title, description, time]);
  }

  findAdsById(ads_id) {
    const _sql = "SELECT * FROM ads_info WHERE id = ?;";
    return query(_sql, ads_id);
  }

  updateAds(ads_id, user_id, { asset_link, link, button_name, title, description }) {
    let params = [link, button_name, title, description, ads_id, user_id];
    if (!isNullOrUndefined(asset_link))
      params = [asset_link, ...params];
    const _sql = `
    UPDATE ads_info
    SET
      ${isNullOrUndefined(asset_link) ? "" : "asset_link = ?,"}
      link = ?,
      button_name = ?,
      title = ?,
      description = ?
    WHERE id = ? and user_id = ?;`;
    return query(_sql, params);
  }

  deleteAds(ads_id) {
    const _sql = "DELETE FROM ads_info WHERE id = ?;";
    return query(_sql, ads_id);
  }

  requestAds(ads_id, user_id, impressions) {
    const _sql = "UPDATE ads_info SET impressions = ?, status = ? WHERE id = ? and user_id = ?;";
    return query(_sql, [impressions, this.AdsStatus.Pending, ads_id, user_id]);
  }

  findAdsByUserId(user_id) {
    const _sql = "SELECT * FROM ads_info WHERE user_id = ?;";
    return query(_sql, user_id);
  }

  findAllAds() {
    const _sql = "SELECT * FROM ads_info";
    return query(_sql);
  }

  findApprovedAds() {
    const _sql = "SELECT * FROM ads_info WHERE status = ?;";
    return query(_sql, [this.AdsStatus.Approved]);
  }

  findAdsToRain() {
    const _sql = "SELECT * FROM ads_info WHERE status = ? and impressions > 0 ORDER BY last_time ASC LIMIT 1;";
    return query(_sql, [this.AdsStatus.Approved]);
  }

  rainAds(id, impression, last_time) {
    const _sql = "UPDATE ads_info SET impressions = ?, last_time = ? WHERE id = ?;";
    return query(_sql, [impression, last_time, id]);
  }
}