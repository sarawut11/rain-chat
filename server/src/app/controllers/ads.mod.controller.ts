import { ServicesContext, RainContext } from "../context";
import { Ads, User } from "../models";
import configs from "@configs";

export const getAllAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsService } = ServicesContext.getInstance();

    const checkRole = await isModerator(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const result = await adsService.findAllAds();
    ctx.body = {
      success: true,
      message: "Success",
      ads: result
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const rejectAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsId } = ctx.params;
    const { adsService } = ServicesContext.getInstance();

    const checkRole = await isModerator(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }
    const checkAds = await checkAdsStatus(adsId);
    if (checkAds.success === false) {
      ctx.body = checkAds;
      return;
    }

    await adsService.updateStatus(adsId, Ads.STATUS.Rejected);
    const ads = await adsService.findAdsById(adsId);
    ctx.body = {
      success: true,
      message: "Successfully Rejected",
      ads: ads[0],
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const approveAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsId } = ctx.params;
    const { adsService } = ServicesContext.getInstance();

    const checkRole = await isModerator(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }
    const checkAds = await checkAdsStatus(adsId);
    if (checkAds.success === false) {
      ctx.body = checkAds;
      return;
    }

    await adsService.updateStatus(adsId, Ads.STATUS.Approved);

    // Test -> Share revenue at this point | Move to wallet controller later
    // const totalAmount = checkAds.existingAds.impressions * (checkAds.existingAds.costPerImp / configs.ads.revenue.imp_revenue);
    // await confirmAds(adsId, totalAmount, checkAds.existingAds.type);

    const ads = await adsService.findAdsById(adsId);

    ctx.body = {
      success: true,
      message: "Successfully Approved",
      ads: ads[0],
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

const confirmAds = async (adsId: number, amount: number, type: number) => {
  const { adsService, userService } = ServicesContext.getInstance();
  await adsService.updateStatus(adsId, Ads.STATUS.Paid);

  // Revenue Share Model
  // ===== Company Share ===== //
  // 25% | Company Revenue
  // ---------------------------------
  // 20% -----> Company Expenses
  // 30% -----> Owner Share
  // 25% -----> Moderator Share
  // 25% -----> Membership Users Share
  const companyRevenue = amount * configs.ads.revenue.company_revenue;
  const companyExpense = companyRevenue * configs.company_revenue.company_expenses;
  const ownerShare = companyRevenue * configs.company_revenue.owner_share;
  const moderatorShare = companyRevenue * configs.company_revenue.moderator_share;
  const membersShare = companyRevenue * configs.company_revenue.membership_share;

  // await userService.shareRevenue(companyExpense, User.ROLE.COMPANY); // Deposit company wallet directly
  await userService.shareRevenue(ownerShare, User.ROLE.OWNER);
  await userService.shareRevenue(moderatorShare, User.ROLE.MODERATOR);
  await userService.shareRevenue(membersShare, User.ROLE.UPGRADED_USER);

  // ===== Rain Rest ===== //
  // 75% | Ads Operation
  // ---------------------------------
  // Rain Room Ads -> buy impressions
  // Static Ads -> Rain Last 200 Users
  if (type === Ads.TYPE.StaticAds) {
    const restShare = amount - companyRevenue;
    RainContext.getInstance().rainUsersByLastActivity(restShare);
  }
};

const isModerator = (username): Promise<any> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const RowDataPacket = await userService.getUserInfoByUsername(username);
  if (RowDataPacket.length <= 0) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
  const userInfo = RowDataPacket[0];
  if (userInfo.role !== User.ROLE.MODERATOR) {
    resolve({
      success: false,
      message: "You are not a Moderator."
    });
    return;
  }
  resolve({
    success: true,
    userInfo,
  });
});

const checkAdsStatus = (adsId): Promise<{
  success: boolean,
  message?: string,
  existingAds?: Ads
}> => new Promise(async (resolve, reject) => {
  if (adsId === undefined) {
    resolve({
      success: false,
      message: "Can't find adsId field."
    });
    return;
  }
  const { adsService } = ServicesContext.getInstance();
  const RowDataPacket = await adsService.findAdsById(adsId);
  if (RowDataPacket.length === 0) {
    resolve({
      success: false,
      message: "Ads doesn't exist"
    });
    return;
  }
  const existingAds = RowDataPacket[0];
  if (existingAds.status === Ads.STATUS.Approved) {
    resolve({
      success: false,
      message: "This ads is already approved."
    });
    return;
  }
  if (existingAds.status !== Ads.STATUS.Pending) {
    resolve({
      success: false,
      message: "This ads is not in pending."
    });
    return;
  }
  resolve({
    success: true,
    existingAds
  });
});