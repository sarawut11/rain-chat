import { query } from "../utils/db";
import configs from "@configs";
import { isNullOrUndefined } from "util";

export class AdsService {
  public static readonly AdsStatus = {
    Created: 0,
    Pending: 1,
    Approved: 2,
    Rejected: 3,
  };

  insertAds({ user_id, asset_link, link, button_name, title, description, time }) {
    const _sql = "insert into ads_info(user_id,asset_link,link,button_name,title,description,time) values(?,?,?,?,?,?,?);";
    return query(_sql, [user_id, asset_link, link, button_name, title, description, time]);
  }

  findAdsById(adsId) {
    const _sql = "SELECT * FROM ads_info WHERE id = ?;";
    return query(_sql, adsId);
  }

  updateAds(adsId, userId, { asset_link, link, button_name, title, description }) {
    let params = [link, button_name, title, description, adsId, userId];
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

  deleteAds(adsId) {
    const _sql = "DELETE FROM ads_info WHERE id = ?;";
    return query(_sql, adsId);
  }

  requestAds(adsId, userId, impressions) {
    const _sql = "UPDATE ads_info SET impressions = ?, status = ? WHERE id = ? and user_id = ?;";
    return query(_sql, [impressions, AdsService.AdsStatus.Pending, adsId, userId]);
  }

  cancelAds(adsId, userId) {
    const _sql = "UPDATE ads_info SET status = ? WHERE id = ? and user_id = ?;";
    return query(_sql, [AdsService.AdsStatus.Pending, adsId, userId]);
  }

  approveAds(adsId) {
    const _sql = "UPDATE ads_info SET status = ? WHERE id = ?;";
    return query(_sql, [AdsService.AdsStatus.Approved, adsId]);
  }

  rejectAds(adsId) {
    const _sql = "UPDATE ads_info SET status = ? WHERE id = ?;";
    return query(_sql, [AdsService.AdsStatus.Rejected, adsId]);
  }

  findAdsByUserId(userId) {
    const _sql = "SELECT * FROM ads_info WHERE user_id = ?;";
    return query(_sql, userId);
  }

  findAllAds() {
    const _sql = "SELECT * FROM ads_info";
    return query(_sql);
  }

  findApprovedAds() {
    const _sql = "SELECT * FROM ads_info WHERE status = ?;";
    return query(_sql, [AdsService.AdsStatus.Approved]);
  }

  findAdsToRain() {
    const _sql = "SELECT * FROM ads_info WHERE status = ? and impressions > 0 ORDER BY last_time ASC LIMIT 1;";
    return query(_sql, [AdsService.AdsStatus.Approved]);
  }

  rainAds(id, impression, lastTime) {
    const _sql = "UPDATE ads_info SET impressions = ?, last_time = ? WHERE id = ?;";
    return query(_sql, [impression, lastTime, id]);
  }
}