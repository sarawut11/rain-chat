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
    const rain_time_interval = configs.rain.rain_time_interval / 1000;
    RainContext.rainJob = new CronJob(`*/${rain_time_interval} * * * * *`, async () => {
      try {
        const { adsService, userService } = ServicesContext.getInstance();
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

        // Show Ads First
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
        setTimeout(async () => {
          const impressions = ads.impressions;
          const clients = await socketServer.getRoomClients(configs.rain.group_id);

          // Rain
          let rainReward = 0;
          if (impressions > clients.length) { // Enough impressions
            rainReward = configs.rain.cost_per_impression;
          } else { // Insufficient impressions
            rainReward = configs.rain.cost_per_impression * impressions / clients.length;
          }
          console.log("Ads Rain Reward:", rainReward);

          await this.rainUsers(clients, rainReward);
          await adsService.rainAds(ads.id, impressions - clients.length, moment().utc().unix());
        }, configs.rain.ads_duration);
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
  }
}