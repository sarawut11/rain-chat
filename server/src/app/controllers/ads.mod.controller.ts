import { ServicesContext } from "../context";
import { UserService, AdsService } from "../services";

export const getAllAds = async (ctx, next) => {
  try {
    const { username } = ctx.params;
    const { adsService } = ServicesContext.getInstance();

    const checkResult = await checkUserRole(username);
    if (checkResult.success === false) {
      ctx.body = checkResult;
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

    const checkResult = await checkUserRole(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }
    const { userInfo, existingAds } = checkResult;
    if (existingAds.status === AdsService.AdsStatus.Approved) {
      ctx.body = {
        success: false,
        message: "This ads is already approved."
      };
      return;
    }
    if (existingAds.status !== AdsService.AdsStatus.Pending) {
      ctx.body = {
        success: false,
        message: "This ads is not in pending."
      };
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

    const checkResult = await checkUserRole(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }
    const { userInfo, existingAds } = checkResult;
    if (existingAds.status === AdsService.AdsStatus.Approved) {
      ctx.body = {
        success: false,
        message: "This ads is already approved."
      };
      return;
    }
    if (existingAds.status !== AdsService.AdsStatus.Pending) {
      ctx.body = {
        success: false,
        message: "This ads is not in pending."
      };
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

const checkUserRole = (username, ads_id?): Promise<any> => new Promise(async (resolve, reject) => {
  const { adsService, userService } = ServicesContext.getInstance();
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
  if (ads_id === undefined) {
    resolve({
      success: true,
      userInfo
    });
    return;
  }
  const existingAds = await adsService.findAdsById(ads_id);
  if (existingAds.length == 0) {
    resolve({
      success: false,
      message: "Ads doesn't exist"
    });
    return;
  }
  resolve({
    success: true,
    userInfo,
    existingAds: existingAds[0]
  });
});