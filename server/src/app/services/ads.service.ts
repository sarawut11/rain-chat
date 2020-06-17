import { query } from "../utils/db";
import configs from "@configs";
import { isNullOrUndefined } from "util";
import { Ads } from "../models";

export class AdsService {

  insertAds({ userId, assetLink, link, buttonLabel, title, description, time }) {
    const _sql = "insert into ads_info(userId,assetLink,link,buttonLabel,title,description,time) values(?,?,?,?,?,?,?);";
    return query(_sql, [userId, assetLink, link, buttonLabel, title, description, time]);
  }

  findAdsById(adsId) {
    const _sql = "SELECT * FROM ads_info WHERE id = ?;";
    return query(_sql, adsId);
  }

  updateAds(adsId, userId, { assetLink, link, buttonLabel, title, description }) {
    let params = [link, buttonLabel, title, description, adsId, userId];
    if (!isNullOrUndefined(assetLink))
      params = [assetLink, ...params];
    const _sql = `
    UPDATE ads_info
    SET
      ${isNullOrUndefined(assetLink) ? "" : "assetLink = ?,"}
      link = ?,
      buttonLabel = ?,
      title = ?,
      description = ?
    WHERE id = ? and userId = ?;`;
    return query(_sql, params);
  }

  deleteAds(adsId) {
    const _sql = "DELETE FROM ads_info WHERE id = ?;";
    return query(_sql, adsId);
  }

  requestAds(adsId, userId, impressions) {
    const _sql = "UPDATE ads_info SET impressions = ?, status = ? WHERE id = ? and userId = ?;";
    return query(_sql, [impressions, Ads.STATUS.Pending, adsId, userId]);
  }

  cancelAds(adsId, userId) {
    const _sql = "UPDATE ads_info SET status = ? WHERE id = ? and userId = ?;";
    return query(_sql, [Ads.STATUS.Created, adsId, userId]);
  }

  approveAds(adsId) {
    const _sql = "UPDATE ads_info SET status = ? WHERE id = ?;";
    return query(_sql, [Ads.STATUS.Approved, adsId]);
  }

  rejectAds(adsId) {
    const _sql = "UPDATE ads_info SET status = ? WHERE id = ?;";
    return query(_sql, [Ads.STATUS.Rejected, adsId]);
  }

  findAdsByUserId(userId) {
    const _sql = "SELECT * FROM ads_info WHERE userId = ?;";
    return query(_sql, userId);
  }

  findAllAds() {
    const _sql =
      `SELECT ads.*, user.username, user.name, user.avatar, user.email, user.intro, user.role
      FROM ads_info AS ads JOIN user_info as user ON ads.userId = user.id;`;
    return query(_sql);
  }

  findApprovedAds() {
    const _sql = "SELECT * FROM ads_info WHERE status = ?;";
    return query(_sql, [Ads.STATUS.Approved]);
  }

  findAdsToRain() {
    const _sql = "SELECT * FROM ads_info WHERE status = ? and impressions > 0 ORDER BY lastTime ASC LIMIT 1;";
    return query(_sql, [Ads.STATUS.Approved]);
  }

  rainAds(id, impression, lastTime) {
    const _sql = "UPDATE ads_info SET impressions = ?, lastTime = ? WHERE id = ?;";
    return query(_sql, [impression, lastTime, id]);
  }
}