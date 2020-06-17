import * as moment from "moment";
import { socketServer } from "../socket/app.socket";
import { ServicesContext } from "./ServicesContext";
import configs from "@configs";
import { Ads } from "../models";

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
    const adsTimeInterval = configs.ads.ads_time_interval + configs.ads.ads_duration;
    setInterval(() => this.adsRain(), adsTimeInterval);
  }

  async adsRain() {
    try {
      const { userService, adsService } = ServicesContext.getInstance();
      const RowDataPacket: Ads[] = await adsService.findAdsToRain();
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
      await delay(configs.ads.rain_coming_delay);

      // Show Ads First
      console.log("Raining - id:", ads.id);
      RainContext.usersToRainAds = [];
      socketServer.broadcast("showAds", {
        ads: {
          id: ads.id,
          assetLink: ads.assetLink,
          title: ads.title,
          description: ads.description,
          link: ads.link,
          buttonLabel: ads.buttonLabel
        }
      }, error => console.log("showAds Error:", error.message));
      await delay(configs.ads.ads_duration);

      // Rain Rewards after ads duration
      const impressions = ads.impressions;
      let rainReward = 0;
      if (impressions > RainContext.usersToRainAds.length) { // Enough impressions
        rainReward = configs.ads.cost_per_impression_rain;
      } else { // Insufficient impressions
        rainReward = configs.ads.cost_per_impression_rain * impressions / RainContext.usersToRainAds.length;
      }
      console.log("Ads Rain Reward:", rainReward);

      const socketIdData = await userService.getSocketIdsByUserids(RainContext.usersToRainAds);
      const socketIds: string[] = [];
      socketIdData.forEach(element => socketIds.push(element.socketid));

      await RainContext.instance.rainUsers(socketIds, rainReward);
      await adsService.rainAds(ads.id, impressions - RainContext.usersToRainAds.length, moment().utc().unix());
    } catch (error) {
      console.log("Rain Failed, ", error.message);
    }
  }

  async rainUsers(clients: string[], rainReward: number) {
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
    const userIds: string[] = [];
    let popReward = 0;
    users.forEach(user => {
      userIds.push(user.id);
      popReward += Number(user.pop_balance);
    });
    await userService.resetPopbalance(userIds);

    // Get Last Active Users
    this.rainUsersByLastActivity(popReward);
  }

  async rainUsersByLastActivity(amount) {
    const { userService } = ServicesContext.getInstance();
    const lastActiveUsers = await userService.getUsersByLastActivity(configs.rain.pop_rain_last_post);
    amount /= lastActiveUsers.length;
    const socketIds = [];
    lastActiveUsers.forEach(user => socketIds.push(user.socketid.split(",")));
    console.log(`Rain ${lastActiveUsers.length} users with ${amount} rewards for each`);
    this.rainUsers(socketIds, amount);
  }

  addUserToRainAds(userId: string): void {
    RainContext.usersToRainAds.push(userId);
  }
}

const delay = ms => new Promise(res => setTimeout(res, ms));