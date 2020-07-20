import { ServicesContext } from "@context";
import { socketServer, socketEventNames, getRain } from "@sockets";
import { Ads, User, InnerTransaction } from "@models";

export class RainContext {
  static instance: RainContext;
  static usersToRainAds: number[];

  readonly RAIN_ADS_COMING_AFTER: number = Number(process.env.RAIN_ADS_COMING_AFTER);
  readonly RAIN_ADS_DURATION: number = Number(process.env.RAIN_ADS_DURATION);
  readonly RAIN_ADS_INTERVAL: number = Number(process.env.RAIN_ADS_INTERVAL);
  readonly STATIC_ADS_INTERVAL: number = Number(process.env.STATIC_ADS_INTERVAL);
  readonly STOCKPILE_RAIN_INTERVAL: number = Number(process.env.STOCKPILE_RAIN_INTERVAL);
  readonly COMPANY_STOCKPILE_USERID: number = Number(process.env.COMPANY_STOCKPILE_USERID);
  readonly STOCKPILE_RAIN_AMOUNT: number = Number(process.env.STOCKPILE_RAIN_AMOUNT);
  readonly POP_RAIN_LAST_POST_USER: number = Number(process.env.POP_RAIN_LAST_POST_USER);

  static getInstance(): RainContext {
    if (!RainContext.instance) {
      RainContext.instance = new RainContext();
      RainContext.usersToRainAds = [];
    }
    return RainContext.instance;
  }

  constructor() {
    // Rain Room Ads
    const adsTimeInterval = this.RAIN_ADS_INTERVAL + this.RAIN_ADS_DURATION;
    setInterval(() => this.campaignRainAds(), adsTimeInterval);

    // Static Ads
    setInterval(() => this.campaignStaticAds(), this.STATIC_ADS_INTERVAL);

    // Stockpile Rain
    setInterval(() => this.stockpileRain(), this.STOCKPILE_RAIN_INTERVAL);
  }

  // ========== Stockpile Rain Section ========== //
  async stockpileRain() {
    try {
      const { userService } = ServicesContext.getInstance();
      const stockpile = await userService.findUserById(this.COMPANY_STOCKPILE_USERID);
      if (stockpile === undefined) {
        console.log("Stockpile Rain => No stockpile");
        return;
      }
      if (this.STOCKPILE_RAIN_AMOUNT > stockpile.balance) {
        console.log("Stockpile Rain => Insufficient balance");
        return;
      }

      console.log("Stockpile Rain => Raining", this.STOCKPILE_RAIN_AMOUNT);
      await userService.addBalance(this.COMPANY_STOCKPILE_USERID, -this.STOCKPILE_RAIN_AMOUNT);
      await this.rainUsersByLastActivity(this.STOCKPILE_RAIN_AMOUNT);
    } catch (error) {
      console.log("Stockpile Rain => Failed,", error.message);
    }
  }

  // ========== Ads Rain Section ========== //
  async campaignRainAds() {
    try {
      const { userService, adsService } = ServicesContext.getInstance();
      const ads: Ads = await adsService.findAdsToCampaign(Ads.TYPE.RainRoomAds);
      if (ads === undefined) {
        console.log("Rain Room Ads => No Ads to rain");
        return;
      }
      if (Number(ads.impressions) <= 0) {
        console.log("Rain Room Ads => Insufficient impressions");
        return;
      }

      // Broadcast RainComing event
      socketServer.broadcast("rainComing", {
        after: this.RAIN_ADS_COMING_AFTER
      });
      await delay(this.RAIN_ADS_COMING_AFTER);

      // Show Ads First
      console.log("Rain Room Ads => Show Ads | adsId:", ads.id);
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
      console.log(`Rain Room Ads => Rain Rewards | adsId:${ads.id}, reward:${rainReward}`);

      await RainContext.instance.rainUsers(RainContext.usersToRainAds, rainReward);
      await adsService.campaignAds(ads.id, RainContext.usersToRainAds.length);

      // Send updated impression info to ads' creator
      const creator: User = await userService.findUserById(ads.userId);
      const updatedAd: Ads = await adsService.findAdsById(ads.id);
      socketServer.emitTo(creator.socketid, socketEventNames.UpdateAdsImpressions, {
        adsInfo: updatedAd
      });
    } catch (error) {
      console.log("Rain Room Ads => Failed | Error:", error.message);
    }
  }

  addUserToRainAds(userId: number): void {
    RainContext.usersToRainAds.push(userId);
  }

  // ========== Static Ads Section ========== //
  async campaignStaticAds() {
    const { adsService, userService } = ServicesContext.getInstance();
    const ads: Ads = await adsService.findAdsToCampaign(Ads.TYPE.StaticAds);
    if (ads === undefined) {
      console.log("Static Ads => Failed | No static ads to show");
      return;
    }
    console.log("Static Ads => Campaign Ads | adsId:", ads.id);
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

  // ========== Common Rain Section ========== //
  async rainUsers(userIds: number[], rainReward: number) {
    if (userIds.length === 0) {
      console.log("Rain Users => Failed | No users to rain");
      return;
    }

    // Update DB
    const { userService, innerTranService } = ServicesContext.getInstance();
    const normalReward = rainReward / 2;
    const popReward = rainReward / 2;
    await userService.rainUsers(userIds, normalReward, popReward);
    await innerTranService.addTrans(userIds, normalReward, InnerTransaction.TYPE.RAIN);

    // Notify rained users
    const users: User[] = await userService.getUsersByUserIds(userIds);
    users.forEach(user => getRain(user, normalReward));
    console.log(`Rain Users => Rained | ${userIds.length} users, reward:${rainReward}`);

    await this.popRain();
  }

  async popRain() {
    const { userService } = ServicesContext.getInstance();
    const users: User[] = await userService.getUsersByPopLimited();
    if (users.length === 0) {
      console.log("Pop Rain => Failed | No pop-limited users");
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
    console.log(`Pop Rain => Raining | ${userIds.length} users limited, popReward:${popReward}`);

    // Get Last Active Users
    this.rainUsersByLastActivity(popReward);
  }

  async rainUsersByLastActivity(amount) {
    const { userService } = ServicesContext.getInstance();
    const lastActiveUsers: User[] = await userService.getUsersByLastActivity(this.POP_RAIN_LAST_POST_USER);
    amount /= lastActiveUsers.length;
    const userIds: number[] = [];
    lastActiveUsers.forEach(user => userIds.push(user.id));
    console.log(`Rain Users => Raining ${lastActiveUsers.length} users with ${amount} rewards for each`);
    this.rainUsers(userIds, amount);
  }

}

const delay = ms => new Promise(res => setTimeout(res, ms));