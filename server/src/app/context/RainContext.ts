import { socketServer } from "../socket/app.socket";
import { ServicesContext } from "./ServicesContext";
import { Ads, User } from "../models";
import { socketEventNames } from "../socket/resource.socket";
import { InnerTransaction } from "../models";

export class RainContext {
  static instance: RainContext;
  static usersToRainAds: number[];

  readonly RAIN_ADS_COMING_AFTER: number = Number(process.env.RAIN_ADS_COMING_AFTER);
  readonly RAIN_ADS_DURATION: number = Number(process.env.RAIN_ADS_DURATION);
  readonly RAIN_ADS_INTERVAL: number = Number(process.env.RAIN_ADS_INTERVAL);
  readonly STATIC_ADS_INTERVAL: number = Number(process.env.STATIC_ADS_INTERVAL);
  readonly POP_RAIN_LAST_POST_USER: number = Number(process.env.POP_RAIN_LAST_POST_USER);

  static getInstance(): RainContext {
    if (!RainContext.instance) {
      RainContext.instance = new RainContext();
      RainContext.usersToRainAds = [];
    }
    return RainContext.instance;
  }

  constructor() {
    // Ads Rain
    const adsTimeInterval = this.RAIN_ADS_INTERVAL + this.RAIN_ADS_DURATION;
    setInterval(() => this.campaignRainAds(), adsTimeInterval);

    // Static Ads
    setInterval(() => this.campaignStaticAds(), this.STATIC_ADS_INTERVAL);
  }

  // ========== Ads Rain Section ========== //
  async campaignRainAds() {
    try {
      const { userService, adsService } = ServicesContext.getInstance();
      const ads: Ads = await adsService.findAdsToCampaign(Ads.TYPE.RainRoomAds);
      if (ads === undefined) {
        console.log("No Ads to rain");
        return;
      }
      if (Number(ads.impressions) <= 0) {
        console.log("Insufficient impressions");
        return;
      }

      // Broadcast RainComing event
      console.log("Rain is coming");
      socketServer.broadcast("rainComing", {
        after: this.RAIN_ADS_COMING_AFTER
      });
      await delay(this.RAIN_ADS_COMING_AFTER);

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
        },
        duration: this.RAIN_ADS_DURATION
      });
      await delay(this.RAIN_ADS_DURATION);

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
      const creator: User = await userService.findUserById(ads.userId);
      const updatedAd: Ads = await adsService.findAdsById(ads.id);
      socketServer.emitTo(creator.socketid, socketEventNames.UpdateAdsImpressions, {
        adsInfo: updatedAd
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
    const { userService, innerTranService } = ServicesContext.getInstance();
    const normalReward = rainReward / 2;
    const popReward = rainReward / 2;
    await userService.rainUsers(userIds, normalReward, popReward);
    await innerTranService.addTrans(userIds, normalReward, InnerTransaction.TYPE.RAIN);
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
    const lastActiveUsers: User[] = await userService.getUsersByLastActivity(this.POP_RAIN_LAST_POST_USER);
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
    const ads: Ads = await adsService.findAdsToCampaign(Ads.TYPE.StaticAds);
    if (ads === undefined) {
      console.log("No Static Ads to campaign");
      return;
    }
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
    const creator: User = await userService.findUserById(ads.userId);
    const updatedAd: Ads = await adsService.findAdsById(ads.id);
    socketServer.emitTo(creator.socketid, socketEventNames.UpdateAdsImpressions, {
      adsInfo: updatedAd
    });
  }
}

const delay = ms => new Promise(res => setTimeout(res, ms));