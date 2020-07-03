import * as moment from "moment";
import { query } from "../utils/db";
import { isNullOrUndefined } from "util";
import { Ads } from "../models";

export class AdsService {

  readonly TABLE_NAME = "ads_info";
  readonly COLUMNS = {
    id: "id",
    userId: "userId",
    type: "type",
    status: "status",
    impressions: "impressions",
    givenImp: "givenImp",
    costPerImp: "costPerImp",
    paidAmount: "paidAmount",
    title: "title",
    description: "description",
    buttonLabel: "buttonLabel",
    assetLink: "assetLink",
    link: "link",
    lastTime: "lastTime",
    time: "time",
  };

  insertAds({ userId, assetLink, link, buttonLabel, title, description, time, type }) {
    const sql = `
      INSERT INTO ${this.TABLE_NAME}(
        userId,assetLink,link,buttonLabel,title,description,type,time
      ) values(?,?,?,?,?,?,?,?);`;
    return query(sql, [userId, assetLink, link, buttonLabel, title, description, type, time]);
  }

  findAdsById(adsId) {
    const sql = "SELECT * FROM ads_info WHERE id = ?;";
    return query(sql, adsId);
  }

  updateAds(adsId, userId, { assetLink, link, buttonLabel, title, description }) {
    let params = [link, buttonLabel, title, description, adsId, userId];
    if (!isNullOrUndefined(assetLink))
      params = [assetLink, ...params];
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${isNullOrUndefined(assetLink) ? "" : `${this.COLUMNS.assetLink} = ?,`}
        ${this.COLUMNS.link} = ?,
        ${this.COLUMNS.buttonLabel} = ?,
        ${this.COLUMNS.title} = ?,
        ${this.COLUMNS.description} = ?
      WHERE id = ? and userId = ?;`;
    return query(sql, params);
  }

  deleteAds(adsId) {
    const sql = "DELETE FROM ads_info WHERE id = ?;";
    return query(sql, adsId);
  }

  setImpressions(adsId, userId, impressions, costPerImp, paidAmount) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.COLUMNS.impressions} = ?,
        ${this.COLUMNS.costPerImp} = ?,
        ${this.COLUMNS.status} = ?,
        ${this.COLUMNS.paidAmount} = ?
      WHERE id = ? AND userId = ?;`;
    return query(sql, [impressions, costPerImp, Ads.STATUS.Paid, paidAmount, adsId, userId]);
  }

  cancelAds(adsId, userId) {
    const sql = "UPDATE ads_info SET status = ? WHERE id = ? and userId = ?;";
    return query(sql, [Ads.STATUS.Created, adsId, userId]);
  }

  findAdsByUserId(userId) {
    const sql = "SELECT * FROM ads_info WHERE userId = ?;";
    return query(sql, userId);
  }

  findAllAds() {
    const sql =
      `SELECT ads.*, user.username, user.name, user.avatar, user.email, user.intro, user.role
      FROM ads_info AS ads JOIN user_info as user ON ads.userId = user.id;`;
    return query(sql);
  }

  updateStatus(id, status) {
    const sql = `UPDATE ${this.TABLE_NAME} SET status = ? WHERE id = ?;`;
    return query(sql, [status, id]);
  }

  findAdsToCampaign(type) {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.COLUMNS.type} = ? AND
        ${this.COLUMNS.status} = ? AND
        ${this.COLUMNS.impressions} > ${this.COLUMNS.givenImp}
      ORDER BY lastTime ASC LIMIT 1;`;
    return query(sql, [type, Ads.STATUS.Paid]);
  }

  campaignAds(id, impression) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.COLUMNS.givenImp} = ${this.COLUMNS.givenImp} + ?,
        ${this.COLUMNS.lastTime} = ?
      WHERE id = ?;`;
    return query(sql, [impression, moment().utc().unix(), id]);
  }

  consumeImpression(id: number, impressions: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.COLUMNS.givenImp} = ${this.COLUMNS.givenImp} + ?
      WHERE ${this.COLUMNS.id} = ?;`;
    return query(sql, [impressions, id]);
  }
}