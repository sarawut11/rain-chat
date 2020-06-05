import { ServicesContext } from "../context";
import { UserService, AdsService } from "../services";

export const getAllAds = async (ctx, next) => {
  try {
    const { username } = ctx.params;
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
    const { username } = ctx.params;
    const { adsId } = ctx.request.body;
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

    await adsService.rejectAds(adsId);
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
    const { username } = ctx.params;
    const { adsId } = ctx.request.body;
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

    await adsService.approveAds(adsId);
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
  if (userInfo.role !== UserService.Role.MODERATOR) {
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

const checkAdsStatus = (adsId): Promise<any> => new Promise(async (resolve, reject) => {
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
  if (existingAds.status === AdsService.AdsStatus.Approved) {
    resolve({
      success: false,
      message: "This ads is already approved."
    });
    return;
  }
  if (existingAds.status !== AdsService.AdsStatus.Pending) {
    resolve({
      success: false,
      message: "This ads is not in pending."
    });
    return;
  }
  resolve({
    success: true,
    existingAds: existingAds[0]
  });
});