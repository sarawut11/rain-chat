import * as moment from "moment";
import { CronJob } from "cron";
import { socketServer } from "../socket/app.socket";
import { ServicesContext } from "./ServicesContext";
import configs from "@configs";

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
    // * * * * * *
    // | | | | | |
    // | | | | | day of week
    // | | | | month
    // | | | day of month
    // | | hour
    // | minute
    // second ( optional )
    let abc = 123;
    const rainTimeInterval = configs.rain.rain_time_interval / 1000;
    RainContext.rainJob = new CronJob(`*/${rainTimeInterval} * * * * *`, async () => {
      try {
        const { adsService } = ServicesContext.getInstance();
        const RowDataPacket = await adsService.findAdsToRain();
        if (RowDataPacket.length <= 0) {
          console.log("No Ads to rain");
          return;
        }
        const ads = RowDataPacket[0];
        if (Number(ads.impressions) <= 0) {
          console.log("Insufficient impressions");
          return;
        }

        // Broadcast RainComing event
        console.log("Rain is coming");
        socketServer.broadcast("rainComing", {}, error => console.log("showAds Error:", error.message));

        // Show Ads First
        await delay(configs.rain.rain_coming_delay);
        console.log("Raining - id:", ads.id);
        socketServer.broadcast("showAds", {
          ads: {
            id: ads.id,
            asset_link: ads.asset_link,
            title: ads.title,
            description: ads.description,
            link: ads.link,
            button_name: ads.button_name
          }
        }, error => console.log("showAds Error:", error.message));

        // Rain Rewards after ads duration
        await delay(configs.rain.ads_duration);
        const impressions = ads.impressions;
        const clients = await socketServer.getRoomClients(configs.rain.group_id);

        let rainReward = 0;
        if (impressions > clients.length) { // Enough impressions
          rainReward = configs.rain.cost_per_impression;
        } else { // Insufficient impressions
          rainReward = configs.rain.cost_per_impression * impressions / clients.length;
        }
        console.log("Ads Rain Reward:", rainReward);

        await this.rainUsers(clients, rainReward);
        await adsService.rainAds(ads.id, impressions - clients.length, moment().utc().unix());
      } catch (error) {
        console.log("Rain Failed, ", error.message);
      }
    }, undefined, true, "UTC");
  }

  async rainUsers(clients, rainReward) {
    const { userService } = ServicesContext.getInstance();
    const normalReward = rainReward / 2;
    const popReward = rainReward / 2;
    await userService.rainUsersBySocketId(clients, normalReward, popReward);
    clients.forEach(socketId => {
      socketServer.emitTo(socketId, "getRain", {
        reward: normalReward
      }, error => console.log("getRain Error:", error.message));
    });
    this.popRain();
  }

  async popRain() {
    const { userService } = ServicesContext.getInstance();
    const users = await userService.getUsersByPopLimited();
    if (users.length === 0) {
      console.log("No users with limited pop balance");
      return;
    }

    // Reset Pop Balance
    const userIds = [];
    let popReward = 0;
    users.forEach(user => {
      userIds.push(user.id);
      popReward += Number(user.pop_balance);
    });
    await userService.resetPopbalance(userIds);

    // Get Last Active Users
    const lastActiveUsers = await userService.getUsersByLastActivity(configs.rain.pop_rain_last_post);
    popReward /= lastActiveUsers.length;
    const socketIds = [];
    lastActiveUsers.forEach(user => socketIds.push(user.socketid.split(",")));
    console.log(`Pop rain ${lastActiveUsers.length} users with ${popReward} rewards`);
    this.rainUsers(socketIds, popReward);
  }
}

const delay = ms => new Promise(res => setTimeout(res, ms));