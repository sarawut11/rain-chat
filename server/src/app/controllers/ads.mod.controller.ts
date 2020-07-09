import { ServicesContext } from "../context";
import { Ads, User } from "../models";

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
      ads,
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
    const { username, id } = ctx.state.user;
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

    await adsService.approveAds(adsId, id);

    const ads = await adsService.findAdsById(adsId);

    ctx.body = {
      success: true,
      message: "Successfully Approved",
      ads,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

const isModerator = (username): Promise<any> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const userInfo: User = await userService.getUserInfoByUsername(username);
  if (userInfo === undefined) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
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
  const existingAds: Ads = await adsService.findAdsById(adsId);
  if (existingAds === undefined) {
    resolve({
      success: false,
      message: "Ads doesn't exist"
    });
    return;
  }
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