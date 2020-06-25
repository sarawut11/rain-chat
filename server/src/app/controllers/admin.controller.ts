import { ServicesContext } from "../context";
import { User, Ads, AdsExt } from "../models";
import { Transaction } from "../models/transaction.model";

export const getHomeAnalytics = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, transactionService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    // Get Transaction Analytics
    let totalAdPurchases = 0;
    const allTrans: Transaction[] = await transactionService.getTransactions();
    allTrans.forEach(tran => {
      if (tran.type === Transaction.TYPE.ADS)
        totalAdPurchases += tran.paidAmount;
    });

    // Get User Analytics
    let totalMembersCount = 0;
    let freeMembersCount = 0;
    let upgradedMembersCount = 0;
    let moderatorsCount = 0;
    let onlineModeratorsCount = 0;
    const allUsers: User[] = await userService.fuzzyMatchUsers("%%");
    allUsers.forEach(user => {
      if (user.role === User.ROLE.FREE) freeMembersCount++;
      if (user.role === User.ROLE.UPGRADED_USER) upgradedMembersCount++;
      if (user.role === User.ROLE.MODERATOR) moderatorsCount++;
      if (user.role === User.ROLE.MODERATOR && user.socketid !== "") onlineModeratorsCount++;
    });
    totalMembersCount = allUsers.length;

    ctx.body = {
      success: true,
      totalAdPurchases,
      totalMembersCount,
      freeMembersCount,
      upgradedMembersCount,
      moderatorsCount,
      onlineModeratorsCount,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const updateModers = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { usernamelist } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const usernames: string[] = usernamelist.split(",");
    await userService.setModers(usernames);
    const users: User[] = await userService.getUsersByUsernames(usernames);
    ctx.body = {
      success: true,
      users,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const cancelModer = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { username: modUsername } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    await userService.cancelModer(modUsername);
    const updatedUser: User[] = await userService.findUserByUsername(modUsername);
    ctx.body = {
      success: true,
      userInfo: updatedUser[0]
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const getAdsAnalytics = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const allAds: AdsExt[] = await adsService.findAllAds();
    const staticAds: AdsAnalytics = new AdsAnalytics();
    const rainAds: AdsAnalytics = new AdsAnalytics();
    allAds.forEach(ads => {
      if (ads.type === Ads.TYPE.StaticAds) {
        staticAds.adsCount++;
        if (ads.status === Ads.STATUS.Approved) staticAds.approvedAds++;
        if (ads.status === Ads.STATUS.Pending) staticAds.pendingAds++;
        if (ads.status === Ads.STATUS.Paid) {
          staticAds.readyAds++;
          staticAds.totalPurchase += ads.paidAmount;
          staticAds.totalImpGiven += ads.givenImp;
          staticAds.totalImpPurchased += ads.impressions;
        }
      }
      if (ads.type === Ads.TYPE.RainRoomAds) {
        rainAds.adsCount++;
        if (ads.status === Ads.STATUS.Approved) rainAds.approvedAds++;
        if (ads.status === Ads.STATUS.Pending) rainAds.pendingAds++;
        if (ads.status === Ads.STATUS.Paid) {
          rainAds.readyAds++;
          rainAds.totalPurchase += ads.paidAmount;
          rainAds.totalImpGiven += ads.givenImp;
          rainAds.totalImpPurchased += ads.impressions;
        }
      }
    });

    ctx.body = {
      success: true,
      staticAds,
      rainAds,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

const isOwner = (username): Promise<any> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const RowDataPacket: User[] = await userService.getUserInfoByUsername(username);
  if (RowDataPacket.length <= 0) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
  const userInfo = RowDataPacket[0];
  if (userInfo.role !== User.ROLE.OWNER) {
    resolve({
      success: false,
      message: "You are not a Owner."
    });
    return;
  }
  resolve({
    success: true,
    userInfo,
  });
});

class AdsAnalytics {
  adsCount: number;
  pendingAds: number;
  approvedAds: number;
  readyAds: number;
  totalPurchase: number;
  totalImpPurchased: number;
  totalImpGiven: number;

  constructor() {
    this.adsCount = 0;
    this.pendingAds = 0;
    this.approvedAds = 0;
    this.readyAds = 0;
    this.totalPurchase = 0;
    this.totalImpPurchased = 0;
    this.totalImpGiven = 0;
  }
}