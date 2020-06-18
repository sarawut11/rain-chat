import * as mime from "mime-types";
import * as moment from "moment";
import * as aws from "../utils/aws";
import { ParameterizedContext } from "koa";
import { ServicesContext, CMCContext } from "../context";
import { Ads, User } from "../models";
import configs from "@configs";

export const registerAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { link, buttonLabel, title, description, type } = ctx.request.body;
    const asset = ctx.request.files.asset;
    const { userService, adsService } = ServicesContext.getInstance();

    if (asset === undefined) {
      ctx.body = {
        success: false,
        message: "Attach a video or an image and try again."
      };
      return;
    }

    // Check Username
    const RowDataPacket: User[] = await userService.findUserByUsername(username);
    if (RowDataPacket.length <= 0) {
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }
    const userInfo = RowDataPacket[0];

    // Upload Asset
    const fileName = generateFileName(username, asset.type);
    const { url } = await aws.uploadFile({
      fileName,
      filePath: asset.path,
      fileType: asset.type,
    });

    // Register DB
    const res = await adsService.insertAds({
      userId: userInfo.id,
      assetLink: url,
      link,
      buttonLabel,
      title,
      description,
      time: moment().utc().unix(),
      type
    });
    const insertAds: Ads[] = await adsService.findAdsById(res.insertId);
    ctx.body = {
      success: true,
      message: "Successfully Created.",
      ads: insertAds[0]
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const getAdsByUsername = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, adsService } = ServicesContext.getInstance();

    // Check Username
    const RowDataPacket: User[] = await userService.findUserByUsername(username);
    if (RowDataPacket.length <= 0) {
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }
    const userInfo = RowDataPacket[0];

    const result: Ads[] = await adsService.findAdsByUserId(userInfo.id);
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

export const getAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsId } = ctx.params;

    const checkResult = await checkAdsId(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;

    ctx.body = {
      success: true,
      message: "Success",
      ads: existingAds,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const updateAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsId } = ctx.params;
    const asset = ctx.request.files.asset;
    const { link, buttonLabel, title, description } = ctx.request.body;
    const { adsService, userService } = ServicesContext.getInstance();

    const checkResult = await checkAdsId(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;

    // Delete existing asset and upload new asset
    let assetLink: string;
    if (asset !== undefined) {
      await aws.deleteFile(existingAds.assetLink);
      const { url } = await aws.uploadFile({
        fileName: generateFileName(username, asset.type),
        filePath: asset.path,
        fileType: asset.type,
      });
      assetLink = url;
    } else {
      assetLink = existingAds.assetLink;
    }

    // Register DB
    await adsService.updateAds(adsId, userInfo.id, {
      assetLink,
      link,
      buttonLabel,
      title,
      description
    });
    const updatedAds: Ads[] = await adsService.findAdsById(adsId);
    ctx.body = {
      success: true,
      message: "Successfully Updated.",
      ads: updatedAds[0],
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const deleteAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsId } = ctx.params;
    const { adsService } = ServicesContext.getInstance();

    const checkResult = await checkAdsId(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;
    await aws.deleteFile(existingAds.assetLink);
    await adsService.deleteAds(adsId);
    ctx.body = {
      success: true,
      message: "Successfully Deleted."
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const requestAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsId } = ctx.params;
    const { adsService } = ServicesContext.getInstance();

    const checkResult = await checkAdsId(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;
    if (existingAds.status === Ads.STATUS.Pending) {
      ctx.body = {
        success: false,
        message: "This ads is already in pending."
      };
      return;
    }
    if (existingAds.status === Ads.STATUS.Approved) {
      ctx.body = {
        success: false,
        message: "This ads is already approved."
      };
      return;
    }

    await adsService.updateStatus(adsId, Ads.STATUS.Pending);
    const updatedAds: Ads[] = await adsService.findAdsById(adsId);
    ctx.body = {
      success: true,
      message: "Successfully requested",
      ads: updatedAds[0],
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const cancelAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsId } = ctx.params;
    const { adsService } = ServicesContext.getInstance();

    const checkResult = await checkAdsId(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;
    if (existingAds.status !== Ads.STATUS.Pending) {
      ctx.body = {
        success: false,
        message: "This ads is not in pending."
      };
    }

    await adsService.cancelAds(adsId, userInfo.id);
    const updatedAds: Ads[] = await adsService.findAdsById(adsId);
    ctx.body = {
      success: true,
      message: "Successfully canceled.",
      ads: updatedAds[0]
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const purchaseAds = async (ctx: ParameterizedContext, next) => {
  try {
    const { username } = ctx.state.user;
    const { adsId } = ctx.params;
    const { adsService } = ServicesContext.getInstance();
    const { impressions, costPerImp, amount } = ctx.request.body;

    const checkResult = await checkAdsId(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;
    if (existingAds.status !== Ads.STATUS.Approved) {
      ctx.body = {
        success: false,
        message: "This ads is not approved."
      };
      return;
    }

    const realCostPerImp = configs.ads.revenue.imp_revenue * costPerImp;
    await adsService.setImpressions(adsId, userInfo.id, impressions, realCostPerImp);

    // Expire ads after 5 mins when it is still in pending purchase
    setTimeout(async () => {
      const ads: Ads[] = await adsService.findAdsById(adsId);
      if (ads[0].status === Ads.STATUS.PendingPurchase) {
        await adsService.updateStatus(adsId, Ads.STATUS.Approved);
      }
    }, 1000 * 60 * 5); // 5 mins

    // Save transaction info
    // =====================

    const updatedAds: Ads[] = await adsService.findAdsById(adsId);
    ctx.body = {
      success: true,
      message: "Successfully requested.",
      ads: updatedAds[0]
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const getCostPerImpression = async (ctx: ParameterizedContext, next) => {
  try {
    const { type } = ctx.request.query;

    // $1 === 2000 | 1000 impressions
    // 25% -> Company Revenue
    // 75% -> Buy Impressions
    const vitaePrice = CMCContext.getInstance().vitaePriceUSD();
    const usdPerImp = type === Ads.TYPE.RainRoomAds ? configs.ads.cost_per_impression_rain : configs.ads.cost_per_impression_static;
    const vitaePerImp = (usdPerImp / vitaePrice) * (1 / configs.ads.revenue.imp_revenue);
    ctx.body = {
      success: true,
      message: "Success",
      price: vitaePerImp
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const getStaticAds = async (ctx: ParameterizedContext, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, adsService } = ServicesContext.getInstance();

    const ads: Ads[] = await adsService.findAdsToCampaign(Ads.TYPE.StaticAds);
    if (ads.length === 0) {
      ctx.body = {
        success: false,
        message: "No static ads."
      };
      return;
    }
    await adsService.campaignAds(ads[0].id, 1);
    ctx.body = {
      success: true,
      ads: ads[0]
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

const checkAdsId = (username, adsId): Promise<{
  success: boolean,
  message?: string,
  userInfo?: User,
  existingAds?: Ads
}> => new Promise(async (resolve, reject) => {
  const { adsService, userService } = ServicesContext.getInstance();
  const RowDataPacket: Ads[] = await adsService.findAdsById(adsId);
  if (RowDataPacket.length === 0) {
    resolve({
      success: false,
      message: "Ads doesn't exist"
    });
    return;
  }
  const existingAds = RowDataPacket[0];
  const userInfo: User = (await userService.findUserByUsername(username))[0];
  if (existingAds.userId !== userInfo.id) {
    resolve({
      success: false,
      message: "This ads belongs to another user"
    });
    return;
  }
  resolve({
    success: true,
    userInfo,
    existingAds,
  });
});

const generateFileName = (username, fileType) => {
  return `campaign/campaign-${username}-${moment().utc().unix()}.${mime.extension(fileType)}`;
};