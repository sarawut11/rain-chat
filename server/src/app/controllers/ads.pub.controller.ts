import * as mime from "mime-types";
import * as moment from "moment";
import * as aws from "../utils/aws";
import { ServicesContext } from "../context";
import { UserService } from "../services";

export const registerAds = async (ctx, next) => {
  try {
    const { username } = ctx.params;
    const { link, buttonName, title, description } = ctx.request.body;
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
    const RowDataPacket = await userService.getUserInfoByUsername(username);
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
      fileName: fileName,
      filePath: asset.path,
      fileType: asset.type,
    });

    // Register DB
    const res = await adsService.insertAds({
      user_id: userInfo.user_id,
      asset_link: url,
      link,
      button_name: buttonName,
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
    const { username } = ctx.params;
    const { userService, adsService } = ServicesContext.getInstance();

    // Check Username
    const RowDataPacket = await userService.getUserInfoByUsername(username);
    if (RowDataPacket.length <= 0) {
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }
    const userInfo = RowDataPacket[0];

    const result = await adsService.findAdsByUserId(userInfo.user_id);
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
    const { username, id } = ctx.params;

    const checkResult = await checkAdsId(username, id);
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
    const { username, id } = ctx.params;
    const asset = ctx.request.files.asset;
    const { link, buttonName, title, description } = ctx.request.body;
    const { adsService, userService } = ServicesContext.getInstance();

    const checkResult = await checkAdsId(username, id);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;

    // Delete existing asset and upload new asset
    let asset_link: string;
    if (asset !== undefined) {
      await aws.deleteFile(existingAds.asset_link);
      const { url } = await aws.uploadFile({
        fileName: generateFileName(username, asset.type),
        filePath: asset.path,
        fileType: asset.type,
      });
      asset_link = url;
    } else {
      asset_link = existingAds.asset_link;
    }

    // Register DB
    await adsService.updateAds(id, userInfo.user_id, {
      asset_link,
      link,
      button_name: buttonName,
      title,
      description
    });
    const updatedAds = await adsService.findAdsById(id);
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
    const { username, id } = ctx.params;
    const { adsService } = ServicesContext.getInstance();

    const checkResult = await checkAdsId(username, id);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;
    await aws.deleteFile(existingAds.asset_link);
    await adsService.deleteAds(id);
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
    const { username, id } = ctx.params;
    const { impressions } = ctx.request.body;
    const { adsService } = ServicesContext.getInstance();

    const checkResult = await checkAdsId(username, id);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;
    await adsService.requestAds(id, userInfo.user_id, impressions);
    const updatedAds = await adsService.findAdsById(id);
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
    const { username, id } = ctx.params;
    const { adsService } = ServicesContext.getInstance();

    const checkResult = await checkAdsId(username, id);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;
    await adsService.cancelAds(id, userInfo.user_id);
    const updatedAds = await adsService.findAdsById(id);
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

const checkAdsId = (username, ads_id): Promise<any> => new Promise(async (resolve, reject) => {
  const { adsService, userService } = ServicesContext.getInstance();
  const RowDataPacket = await adsService.findAdsById(ads_id);
  if (RowDataPacket.length == 0) {
    resolve({
      success: false,
      message: "Ads doesn't exist"
    });
    return;
  }
  const existingAds = RowDataPacket[0];
  const userInfo = (await userService.getUserInfoByUsername(username))[0];
  if (existingAds.user_id !== userInfo.user_id) {
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
  return `ads/ads-${username}-${moment().utc().unix()}.${mime.extension(fileType)}`;
};