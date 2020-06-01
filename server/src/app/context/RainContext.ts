import { CronJob } from "cron";
import {
  ChatService,
  GroupChatService,
  GroupService,
  UserService,
  AdsService
} from "./../services";

export class RainContext {
  static instance: RainContext;
  static rainJob: CronJob;

  static getInstance(): RainContext {
    if (!RainContext.instance) {
      RainContext.instance = new RainContext();
    }
    return RainContext.instance;
  }

  constructor() {
    RainContext.rainJob = new CronJob("10 * * * * *", () => {
      console.log("Raining");
    }, null, true, "UTC");
  }
}