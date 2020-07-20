import { ServicesContext } from "@context";
import { User, Ads, Transaction } from "@models";
import { isOwner } from "@utils";

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
    const allUsers: User[] = await userService.findMatchUsers("%%");
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

export const getAdsAnalytics = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const allAds: Ads[] = await adsService.findAllAds();
    const staticAds: AdsAnalytics = new AdsAnalytics();
    const rainAds: AdsAnalytics = new AdsAnalytics();
    allAds.forEach(ads => {
      if (ads.type === Ads.TYPE.StaticAds) {
        staticAds.adsCount++;
        if (ads.status === Ads.STATUS.Approved) staticAds.approvedAds++;
        if (ads.status === Ads.STATUS.Pending) staticAds.pendingAds++;
        if (ads.status === Ads.STATUS.Paid) {
          staticAds.purchasedAds++;
          if (ads.impressions > ads.givenImp)
            staticAds.runningAds++;
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
          rainAds.purchasedAds++;
          if (ads.impressions > ads.givenImp)
            rainAds.runningAds++;
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

class AdsAnalytics {
  adsCount: number;
  pendingAds: number;
  approvedAds: number;
  purchasedAds: number;
  runningAds: number;
  totalPurchase: number;
  totalImpPurchased: number;
  totalImpGiven: number;

  constructor() {
    this.adsCount = 0;
    this.pendingAds = 0;
    this.approvedAds = 0;
    this.purchasedAds = 0;
    this.runningAds = 0;
    this.totalPurchase = 0;
    this.totalImpPurchased = 0;
    this.totalImpGiven = 0;
  }
}