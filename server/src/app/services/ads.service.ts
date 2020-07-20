import { query, now } from "@utils";
import { isNullOrUndefined } from "util";
import { Ads } from "@models";

export class AdsService {

  readonly TABLE_NAME = "ads_info";
  readonly COL = {
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
    reviewer: "reviewer",
  };

  insertAds({ userId, assetLink, link, buttonLabel, title, description, time, type }) {
    const sql = `
      INSERT INTO ${this.TABLE_NAME}(
        ${this.COL.userId},
        ${this.COL.assetLink},
        ${this.COL.link},
        ${this.COL.buttonLabel},
        ${this.COL.title},
        ${this.COL.description},
        ${this.COL.type},
        ${this.COL.time}
      ) values(?,?,?,?,?,?,?,?);`;
    return query(sql, [userId, assetLink, link, buttonLabel, title, description, type, time]);
  }

  async findAdsById(adsId: number): Promise<Ads> {
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.COL.id} = ?;`;
    const ads: Ads[] = await query(sql, adsId);
    if (ads.length === 0) return undefined;
    return ads[0];
  }

  updateAds(adsId: number, userId: number, { assetLink, link, buttonLabel, title, description }) {
    let params = [link, buttonLabel, title, description, adsId, userId];
    if (!isNullOrUndefined(assetLink))
      params = [assetLink, ...params];
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${isNullOrUndefined(assetLink) ? "" : `${this.COL.assetLink} = ?,`}
        ${this.COL.link} = ?,
        ${this.COL.buttonLabel} = ?,
        ${this.COL.title} = ?,
        ${this.COL.description} = ?
      WHERE
        ${this.COL.id} = ? AND
        ${this.COL.userId} = ?;`;
    return query(sql, params);
  }

  deleteAds(adsId: number) {
    const sql = `DELETE FROM ${this.TABLE_NAME} WHERE ${this.COL.id} = ?;`;
    return query(sql, adsId);
  }

  setImpressions(adsId: number, userId: number, impressions: number, costPerImp: number, paidAmount: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.COL.impressions} = ?,
        ${this.COL.costPerImp} = ?,
        ${this.COL.status} = ?,
        ${this.COL.paidAmount} = ?
      WHERE id = ? AND userId = ?;`;
    return query(sql, [impressions, costPerImp, Ads.STATUS.Paid, paidAmount, adsId, userId]);
  }

  cancelAds(adsId: number, userId: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET ${this.COL.status} = ?
      WHERE
        ${this.COL.id} = ? AND
        ${this.COL.userId} = ?;`;
    return query(sql, [Ads.STATUS.Created, adsId, userId]);
  }

  async findAdsByUserId(userId: number): Promise<Ads[]> {
    const sql = `SELECT * FROM ${this.TABLE_NAME} WHERE ${this.COL.userId} = ?;`;
    const ads: Ads[] = await query(sql, userId);
    return ads;
  }

  async findAllAds(): Promise<Ads[]> {
    const sql = `
      SELECT ads.*,
        creator.username as creatorUsername,
        creator.name as creatorName,
        creator.avatar as creatorAvatar,
        reviewer.username as reviewerUsername,
        reviewer.name as reviewerName,
        reviewer.avatar as reviewerAvatar
      FROM ${this.TABLE_NAME} AS ads
      JOIN user_info as creator ON ads.userId = creator.id
      JOIN user_info as reviewer ON ads.reviewer = reviewer.id;`;
    const ads: Ads[] = await query(sql);
    return ads;
  }

  updateStatus(id: number, status: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET ${this.COL.status} = ?
      WHERE ${this.COL.id} = ?;`;
    return query(sql, [status, id]);
  }

  approveAds(adsId: number, reviewerId: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.COL.status} = ?,
        ${this.COL.reviewer} = ?
      WHERE ${this.COL.id} = ?;`;
    return query(sql, [Ads.STATUS.Approved, reviewerId, adsId]);
  }

  async findAdsToCampaign(type: number): Promise<Ads> {
    const sql = `
      SELECT * FROM ${this.TABLE_NAME}
      WHERE
        ${this.COL.type} = ? AND
        ${this.COL.status} = ? AND
        ${this.COL.impressions} > ${this.COL.givenImp}
      ORDER BY ${this.COL.lastTime} ASC LIMIT 1;`;
    const ads: Ads[] = await query(sql, [type, Ads.STATUS.Paid]);
    if (ads.length === 0) return undefined;
    return ads[0];
  }

  campaignAds(id: number, impression: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.COL.givenImp} = ${this.COL.givenImp} + ?,
        ${this.COL.lastTime} = ?
      WHERE ${this.COL.id} = ?;`;
    return query(sql, [impression, now(), id]);
  }

  consumeImpression(id: number, impressions: number) {
    const sql = `
      UPDATE ${this.TABLE_NAME}
      SET
        ${this.COL.givenImp} = ${this.COL.givenImp} + ?
      WHERE ${this.COL.id} = ?;`;
    return query(sql, [impressions, id]);
  }
}