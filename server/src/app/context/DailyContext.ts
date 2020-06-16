import * as moment from "moment";
import { CronJob } from "cron";
import configs from "@configs";
import { ServicesContext } from "./ServicesContext";
import { UserService } from "../services";

export class DailyContext {
  static instance: DailyContext;
  static membershipJob: CronJob;

  static getInstance(): DailyContext {
    if (!DailyContext.instance) {
      DailyContext.instance = new DailyContext();
    }
    return DailyContext.instance;
  }

  constructor() {
    // * * * * * *
    // | | | | | |
    // | | | | | day of week
    // | | | | month
    // | | | day of month
    // | | hour
    // | minute
    // second ( optional )
    DailyContext.membershipJob = new CronJob("0 0 * * *", async () => {
      try {
        console.log("Checking Membership Expiration");
        const { userService } = ServicesContext.getInstance();
        const expireTime = moment().utc().subtract(1, "months").unix();
        const expiredUsers = await userService.getUsersByExpired(UserService.Role.UPGRADED_USER, expireTime);
        await userService.resetExpiredRole(UserService.Role.UPGRADED_USER, expireTime);
        console.log(`${expiredUsers.length} users' membership have been expired`);
      } catch (error) {
        console.log(error.message);
      }
    }, undefined, true, "UTC");
  }
}