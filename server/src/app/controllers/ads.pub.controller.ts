import * as mime from "mime-types";
import * as moment from "moment";
import * as aws from "../utils/aws";
import { ServicesContext } from "../context";
import { Ads, User } from "../models";

export const registerAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { link, button_name: buttonName, title, description, type } = ctx.request.body;
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
      buttonLabel: buttonName,
      title,
      description,
      time: moment().utc().unix()
    });
    const insertAds = await adsService.findAdsById(res.insertId);
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

    const result = await adsService.findAdsByUserId(userInfo.id);
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
    const updatedAds = await adsService.findAdsById(adsId);
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
    const { impressions } = ctx.request.body;
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
    await adsService.requestAds(adsId, userInfo.id, impressions);
    const updatedAds = await adsService.findAdsById(adsId);
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
    const updatedAds = await adsService.findAdsById(adsId);
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