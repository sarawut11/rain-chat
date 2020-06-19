import * as moment from "moment";
import { socketServer } from "../socket/app.socket";
import { ServicesContext } from "./ServicesContext";
import configs from "@configs";
import { Ads, User } from "../models";
import { socketEventNames } from "../socket/resource.socket";
import { updateAds } from "../controllers";

export class RainContext {
  static instance: RainContext;
  static usersToRainAds: number[];

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
    setInterval(() => this.campaignRainAds(), adsTimeInterval);

    // Static Ads
    const staticAdsTimeInterval = configs.ads.static_ads_interval;
    setInterval(() => this.campaignStaticAds(), staticAdsTimeInterval);
  }
  // ========== Ads Rain Section ========== //
  async campaignRainAds() {
    try {
      const { userService, adsService } = ServicesContext.getInstance();
      const RowDataPacket: Ads[] = await adsService.findAdsToCampaign(Ads.TYPE.RainRoomAds);
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
      socketServer.broadcast("rainComing", {
        after: configs.ads.rain_coming_delay
      });
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
          buttonLabel: ads.buttonLabel,
          type: ads.type,
        }
      });
      await delay(configs.ads.ads_duration);

      // Rain Rewards after ads duration
      const impressions = ads.impressions;
      let rainReward = 0;
      if (impressions > RainContext.usersToRainAds.length) { // Enough impressions
        rainReward = ads.costPerImp;
      } else { // Insufficient impressions
        rainReward = ads.costPerImp * impressions / RainContext.usersToRainAds.length;
      }
      console.log("Ads Rain Reward:", rainReward);

      await RainContext.instance.rainUsers(RainContext.usersToRainAds, rainReward);
      await adsService.campaignAds(ads.id, RainContext.usersToRainAds.length);

      // Send updated impression info to ads' creator
      const creator: User[] = await userService.findUserById(ads.userId);
      const updatedAds: Ads[] = await adsService.findAdsById(ads.id);
      socketServer.emitTo(creator[0].socketid, socketEventNames.UpdateAdsImpressions, {
        adsInfo: updatedAds[0]
      });
    } catch (error) {
      console.log("Rain Failed, ", error.message);
    }
  }

  async rainUsers(userIds: number[], rainReward: number) {
    if (userIds.length === 0) {
      console.log("No clients to rain");
      return;
    }
    const { userService } = ServicesContext.getInstance();
    const normalReward = rainReward / 2;
    const popReward = rainReward / 2;
    await userService.rainUsers(userIds, normalReward, popReward);
    const users: User[] = await userService.getUsersByUserIds(userIds);
    users.forEach(user => {
      socketServer.emitTo(user.socketid, "getRain", {
        reward: normalReward
      }, error => console.log("getRain Error:", error.message));
    });
    await this.popRain();
  }

  async popRain() {
    const { userService } = ServicesContext.getInstance();
    const users: User[] = await userService.getUsersByPopLimited();
    if (users.length === 0) {
      console.log("No users with limited pop balance");
      return;
    }

    // Reset Pop Balance
    const userIds: number[] = [];
    let popReward = 0;
    users.forEach(user => {
      userIds.push(user.id);
      popReward += Number(user.popBalance);
    });
    await userService.resetPopbalance(userIds);

    // Get Last Active Users
    this.rainUsersByLastActivity(popReward);
  }

  async rainUsersByLastActivity(amount) {
    const { userService } = ServicesContext.getInstance();
    const lastActiveUsers: User[] = await userService.getUsersByLastActivity(configs.rain.pop_rain_last_post);
    amount /= lastActiveUsers.length;
    const userIds: number[] = [];
    lastActiveUsers.forEach(user => userIds.push(user.id));
    console.log(`Rain ${lastActiveUsers.length} users with ${amount} rewards for each`);
    this.rainUsers(userIds, amount);
  }

  addUserToRainAds(userId: number): void {
    RainContext.usersToRainAds.push(userId);
  }

  // ========== Static Ads ========== //
  async campaignStaticAds() {
    const { adsService, userService } = ServicesContext.getInstance();
    const RowDataPacket: Ads[] = await adsService.findAdsToCampaign(Ads.TYPE.StaticAds);
    if (RowDataPacket.length === 0) {
      console.log("No Static Ads to campaign");
      return;
    }
    const ads: Ads = RowDataPacket[0];
    console.log("Campaign Static Ads:", ads.id);
    socketServer.broadcast(socketEventNames.ShowStaticAds, {
      ads: {
        id: ads.id,
        assetLink: ads.assetLink,
        title: ads.title,
        description: ads.description,
        link: ads.link,
        buttonLabel: ads.buttonLabel,
        type: ads.type,
      }
    });
    await adsService.campaignAds(ads.id, socketServer.allSocketCount());

    // Send updated impression info to ads' creator
    const creator: User[] = await userService.findUserById(ads.userId);
    const updatedAds: Ads[] = await adsService.findAdsById(ads.id);
    socketServer.emitTo(creator[0].socketid, socketEventNames.UpdateAdsImpressions, {
      adsInfo: updatedAds[0]
    });
  }
}

const delay = ms => new Promise(res => setTimeout(res, ms));