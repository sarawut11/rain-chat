import { ServicesContext } from "@context";
import { Ads, User } from "@models";
import { updateAdsStatus } from "@sockets";

export const getAllAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsService } = ServicesContext.getInstance();

    const checkRole = await isModeratorOrOwner(username);
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

    const checkRole = await isModeratorOrOwner(username);
    if (checkRole.success === false) {
      console.log(`Reject Ads => Failed | ${checkRole.message} | username:${username}`);
      ctx.body = checkRole;
      return;
    }
    const checkAds = await checkAdsStatus(adsId);
    if (checkAds.success === false) {
      console.log(`Reject Ads => Failed | ${checkAds.message} | adsId:${adsId}`);
      ctx.body = checkAds;
      return;
    }

    await adsService.updateStatus(adsId, Ads.STATUS.Rejected);
    const ads = await adsService.findAdsById(adsId);
    await updateAdsStatus(ads);
    console.log(`Reject Ads => Success | adsId:${adsId}, moderator:${username}`);

    ctx.body = {
      success: true,
      message: "Successfully Rejected",
      ads,
    };
  } catch (error) {
    console.log(`Reject Ads => Failed | Error:${error.message}`);
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

    const checkRole = await isModeratorOrOwner(username);
    if (checkRole.success === false) {
      console.log(`Approve Ads => Failed | ${checkRole.message} | username:${username}`);
      ctx.body = checkRole;
      return;
    }
    const checkAds = await checkAdsStatus(adsId);
    if (checkAds.success === false) {
      console.log(`Approve Ads => Failed | ${checkAds.message} | adsId:${adsId}`);
      ctx.body = checkAds;
      return;
    }

    await adsService.approveAds(adsId, id);
    const ads = await adsService.findAdsById(adsId);
    await updateAdsStatus(ads);
    console.log(`Approve Ads => Success | adsId:${adsId}, username:${username}`);

    ctx.body = {
      success: true,
      message: "Successfully Approved",
      ads,
    };
  } catch (error) {
    console.log(`Approve Ads => Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

const isModeratorOrOwner = (username): Promise<{
  success: boolean,
  message: string,
  userInfo?: User
}> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const userInfo: User = await userService.getUserInfoByUsername(username);
  if (userInfo === undefined) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
  if (userInfo.role !== User.ROLE.MODERATOR && userInfo.role !== User.ROLE.OWNER) {
    resolve({
      success: false,
      message: "You are not a Moderator or Owner."
    });
    return;
  }
  resolve({
    success: true,
    message: "Success",
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