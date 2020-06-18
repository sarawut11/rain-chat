import * as moment from "moment";
import { query } from "../utils/db";
import configs from "@configs";
import { isNullOrUndefined } from "util";
import { Ads } from "../models";

export class AdsService {

  readonly TABLE_NAME = "ads_info";

  insertAds({ userId, assetLink, link, buttonLabel, title, description, time }) {
    const _sql = `
      INSERT INTO ${this.TABLE_NAME}(
        userId,assetLink,link,buttonLabel,title,description,type,time
      ) values(?,?,?,?,?,?,?,?);`;
    return query(_sql, [userId, assetLink, link, buttonLabel, title, description, Ads.TYPE.None, time]);
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
      UPDATE ${this.TABLE_NAME}
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

  setImpressions(adsId, userId, impressions, costPerImp, type) {
    const _sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        impressions = ?,
        costPerImp = ?,
        status = ?,
        type = ?
      WHERE id = ? AND userId = ?;`;
    return query(_sql, [impressions, costPerImp, Ads.STATUS.PendingPurchase, type, adsId, userId]);
  }

  cancelAds(adsId, userId) {
    const _sql = "UPDATE ads_info SET status = ? WHERE id = ? and userId = ?;";
    return query(_sql, [Ads.STATUS.Created, adsId, userId]);
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

  updateStatus(id, status) {
    const _sql = `UPDATE ${this.TABLE_NAME} SET status = ? WHERE id = ?;`;
    return query(_sql, [status, id]);
  }

  findAdsToCampaign(type) {
    const _sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        type = ? AND
        status = ? AND
        impressions > 0
      ORDER BY lastTime ASC LIMIT 1;`;
    return query(_sql, [type, Ads.STATUS.Paid]);
  }

  campaignAds(id, impression) {
    const _sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        impressions = impressions - ?,
        lastTime = ?
      WHERE id = ?;`;
    return query(_sql, [impression, moment().utc().unix(), id]);
  }
}