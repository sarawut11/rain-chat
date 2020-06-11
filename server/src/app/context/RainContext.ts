import * as moment from "moment";
import { socketServer } from "../socket/app.socket";
import { ServicesContext } from "./ServicesContext";
import configs from "@configs";

export class RainContext {
  static instance: RainContext;
  static usersToRainAds: string[];

  static getInstance(): RainContext {
    if (!RainContext.instance) {
      RainContext.instance = new RainContext();
      RainContext.usersToRainAds = [];
    }
    return RainContext.instance;
  }

  constructor() {
    // Ads Rain
    const adsTimeInterval = configs.rain.ads_time_interval + configs.rain.ads_duration;
    setInterval(() => this.adsRain(), adsTimeInterval);
  }

  async adsRain() {
    try {
      const { userService, adsService } = ServicesContext.getInstance();
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
      await delay(configs.rain.rain_coming_delay);

      // Show Ads First
      console.log("Raining - id:", ads.id);
      RainContext.usersToRainAds = [];
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
      await delay(configs.rain.ads_duration);

      // Rain Rewards after ads duration
      const impressions = ads.impressions;
      let rainReward = 0;
      if (impressions > RainContext.usersToRainAds.length) { // Enough impressions
        rainReward = configs.rain.cost_per_impression;
      } else { // Insufficient impressions
        rainReward = configs.rain.cost_per_impression * impressions / RainContext.usersToRainAds.length;
      }
      console.log("Ads Rain Reward:", rainReward);

      const socketIds = await userService.getSocketIdsByUserids(RainContext.usersToRainAds);
      await RainContext.instance.rainUsers(socketIds, rainReward);
      await adsService.rainAds(ads.id, impressions - RainContext.usersToRainAds.length, moment().utc().unix());
    } catch (error) {
      console.log("Rain Failed, ", error.message);
    }
  }

  async rainUsers(clients, rainReward) {
    if (clients.length === 0) {
      console.log("No clients to rain");
      return;
    }
    const { userService } = ServicesContext.getInstance();
    const normalReward = rainReward / 2;
    const popReward = rainReward / 2;
    await userService.rainUsersBySocketId(clients, normalReward, popReward);
    clients.forEach(socketId => {
      socketServer.emitTo(socketId, "getRain", {
        reward: normalReward
      }, error => console.log("getRain Error:", error.message));
    });
    await this.popRain();
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

  public addUserToRainAds(userId: string): void {
    RainContext.usersToRainAds.push(userId);
  }
}

const delay = ms => new Promise(res => setTimeout(res, ms));