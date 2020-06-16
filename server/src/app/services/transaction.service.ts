import { query } from "../utils/db";
import configs from "@configs";
import * as moment from "moment";

export class TransactionService {
  public static readonly STATUS = {
    REQUESTED: 0,
    PENDING: 1,
    INSUFFICIENT_BALANCE: 2,
    CONFIRMED: 3
  };

  public static readonly TYPE = {
    ADS: 0,
    MEMBERSHIP: 1,
    VITAE_RAIN: 2
  };

  readonly TABLE_NAME = "transaction_info";
  readonly columns = {
    id: "id",
    userId: "user_id",
    transactionId: "transaction_id",
    type: "type",
    status: "status",
    paidAmount: "paid_amount",
    expectAmount: "expect_amount",
    confirmTime: "confirm_time",
    time: "time",
  };

  createMembershipRequest(userId, expectAmount) {
    const _sql = `
    INSERT INTO ${this.TABLE_NAME}(
      ${this.columns.userId},
      ${this.columns.type},
      ${this.columns.status},
      ${this.columns.expectAmount},
      ${this.columns.time})
    values(?,?,?,?,?);`;
    return query(_sql, [userId, TransactionService.TYPE.MEMBERSHIP, TransactionService.STATUS.REQUESTED, expectAmount, moment().utc().unix()]);
  }

  confirmMembershipRequest(userId: string, amount: number) {
    const _sql = `
    UPDATE ${this.TABLE_NAME}
    SET
      ${this.columns.status} = ?,
      ${this.columns.paidAmount} = ?,
      ${this.columns.confirmTime} = ?
    WHERE user_id = ?;`;
    return query(_sql, [TransactionService.STATUS.CONFIRMED, amount, userId, moment().utc().unix()]);
  }
}