import { ServicesContext } from "@context";
import { socketServer, socketEventNames, getRain } from "@sockets";
import { Ads, User, InnerTransaction, AllSetting, GroupMessage } from "@models";
import { now, roundPrice } from "@utils";

export class RainContext {
  static instance: RainContext;
  static usersToRainAds: number[];

  readonly COMPANY_STOCKPILE_USERID: number = Number(process.env.COMPANY_STOCKPILE_USERID);
  readonly RAIN_GROUP_ID = process.env.RAIN_GROUP_ID;

  settings: AllSetting;

  static getInstance(): RainContext {
    if (!RainContext.instance) {
      RainContext.instance = new RainContext();
      RainContext.usersToRainAds = [];
    }
    return RainContext.instance;
  }

  constructor() {
    this.startRains();
  }

  async updateSettings() {
    const { settingService } = ServicesContext.getInstance();
    this.settings = await settingService.getAllSettings();
  }

  async startRains() {
    await this.updateSettings();

    this.campaignRainAds();
    this.campaignStaticAds();
    this.stockpileRain();
  }

  // ========== Stockpile Rain Section ========== //
  async stockpileRain() {
    try {
      setTimeout(() => this.stockpileRain(), this.settings.STOCKPILE_RAIN_INTERVAL);

      const { userService } = ServicesContext.getInstance();
      const stockpile = await userService.findUserById(this.COMPANY_STOCKPILE_USERID);
      if (stockpile === undefined) {
        console.log("Stockpile Rain => No stockpile");
        return;
      }
      if (this.settings.STOCKPILE_RAIN_AMOUNT > stockpile.balance) {
        console.log("Stockpile Rain => Insufficient balance");
        return;
      }

      console.log("Stockpile Rain => Raining", this.settings.STOCKPILE_RAIN_AMOUNT);
      await userService.addBalance(this.COMPANY_STOCKPILE_USERID, -this.settings.STOCKPILE_RAIN_AMOUNT);
      await this.rainUsersByLastActivity(this.settings.STOCKPILE_RAIN_AMOUNT);
    } catch (error) {
      console.log("Stockpile Rain => Failed,", error.message);
    }
  }

  // ========== Ads Rain Section ========== //
  async campaignRainAds() {
    try {
      setTimeout(() => this.campaignRainAds(), this.settings.RAIN_ADS_INTERVAL + this.settings.RAIN_ADS_DURATION);

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
        after: this.settings.RAIN_ADS_COMING_AFTER
      });
      await delay(this.settings.RAIN_ADS_COMING_AFTER);

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
        duration: this.settings.RAIN_ADS_DURATION
      });
      await delay(this.settings.RAIN_ADS_DURATION);

      // Rain Rewards after ads duration
      const impressions = ads.impressions;
      let rainReward = 0;
      if (impressions > RainContext.usersToRainAds.length) { // Enough impressions
        rainReward = ads.costPerImp;
      } else { // Insufficient impressions
        rainReward = ads.costPerImp * impressions / RainContext.usersToRainAds.length;
      }
      console.log(`Rain Room Ads => Rain Rewards | adsId:${ads.id}, reward:${rainReward}`);

      await RainContext.instance.rainUsers(RainContext.usersToRainAds, rainReward, rainReward * RainContext.usersToRainAds.length);
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
    try {
      setTimeout(() => this.campaignStaticAds(), this.settings.STATIC_ADS_INTERVAL);

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
      const socketCount = await socketServer.allSocketCount();
      await adsService.campaignAds(ads.id, socketCount);

      // Send updated impression info to ads' creator
      const creator: User = await userService.findUserById(ads.userId);
      const updatedAd: Ads = await adsService.findAdsById(ads.id);
      socketServer.emitTo(creator.socketid, socketEventNames.UpdateAdsImpressions, {
        adsInfo: updatedAd
      });
    }
    catch (error) {
      console.log("Static Ads => Failed | Error:", error.message);
    }
  }

  // ========== Common Rain Section ========== //
  async rainUsers(userIds: number[], rainReward: number, totalAmount: number) {
    if (userIds.length === 0) {
      console.log("Rain Users => Failed | No users to rain");
      return;
    }

    // Update DB
    const { userService, innerTranService, groupChatService } = ServicesContext.getInstance();
    const normalReward = rainReward / 2;
    const popReward = rainReward / 2;
    await userService.rainUsers(userIds, normalReward, popReward);
    await innerTranService.addTrans(userIds, normalReward, InnerTransaction.TYPE.RAIN);

    // Notify rained users
    const users: User[] = await userService.getUsersByUserIds(userIds);
    users.forEach(user => getRain(user, normalReward));
    console.log(`Rain Users => Rained | ${userIds.length} users, reward:${rainReward}`);

    const message = `It Rained ${(totalAmount / 2).toFixed(8)} Vitae.`;
    await groupChatService.saveGroupMsg({
      fromUser: 1,
      groupId: this.RAIN_GROUP_ID,
      message,
      time: now(),
      attachments: "",
    });
    socketServer.broadcastChannel(this.RAIN_GROUP_ID, socketEventNames.GetGroupMsg, {
      message,
      groupId: this.RAIN_GROUP_ID,
      tip: "rain",
    });

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
    const { groupChatService } = ServicesContext.getInstance();
    const lastRainMsgs: GroupMessage[] = await groupChatService.getLastRainGroupMsg(this.settings.POP_RAIN_LAST_POST_USER);
    const reward = amount / lastRainMsgs.length;
    const userIds: number[] = [];
    lastRainMsgs.forEach(msg => userIds.push(msg.fromUser));
    console.log(`Rain Users => Raining ${userIds.length} users with ${reward} rewards for each`);
    this.rainUsers(userIds, reward, amount);
  }

}

const delay = ms => new Promise(res => setTimeout(res, ms));