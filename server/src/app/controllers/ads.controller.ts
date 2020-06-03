import * as mime from "mime-types";
import * as moment from "moment";
import * as aws from "../utils/aws";
import { ServicesContext } from "../context";

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
    const ads = {
      user_id: userInfo.user_id,
      asset_link: url,
      link,
      button_name: buttonName,
      title,
      description,
      time: moment().utc().unix()
    };
    const res = await adsService.insertAds(ads);

    ctx.body = {
      success: true,
      message: "Successfully Created.",
      ads: {
        id: res.insertId,
        ...ads,
      }
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

export const getAllAds = async (ctx, next) => {
  try {
    const { adsService } = ServicesContext.getInstance();
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

export const getAds = async (ctx, next) => {
  try {
    const { username, id } = ctx.params;
    const { adsService, userService } = ServicesContext.getInstance();

    const RowDataPacket = await adsService.findAdsById(id);
    if (RowDataPacket.length == 0) {
      ctx.body = {
        success: false,
        message: "Ads doesn't exist"
      };
      return;
    }
    const ads = RowDataPacket[0];
    const userInfo = (await userService.getUserInfoByUsername(username))[0];
    console.log(ads.user_id, userInfo.user_id);
    if (ads.user_id !== userInfo.user_id) {
      ctx.body = {
        success: false,
        message: "This ads belongs to another user"
      };
      return;
    }
    ctx.body = {
      success: true,
      message: "Success",
      ads
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

    const RowDataPacket = await adsService.findAdsById(id);
    if (RowDataPacket.length == 0) {
      ctx.body = {
        success: false,
        message: "Ads doesn't exist"
      };
      return;
    }
    const existingAds = RowDataPacket[0];
    const userInfo = (await userService.getUserInfoByUsername(username))[0];
    if (existingAds.user_id !== userInfo.user_id) {
      ctx.body = {
        success: false,
        message: "This ads belongs to another user"
      };
      return;
    }

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
      asset_link = undefined;
    }

    // Register DB
    await adsService.updateAds(id, userInfo.user_id, {
      asset_link,
      link,
      button_name: buttonName,
      title,
      description
    });
    ctx.body = {
      success: true,
      message: "Successfully Updated."
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
    const { adsService, userService } = ServicesContext.getInstance();

    const RowDataPacket = await adsService.findAdsById(id);
    if (RowDataPacket.length == 0) {
      ctx.body = {
        success: false,
        message: "Ads doesn't exist"
      };
      return;
    }
    const existingAds = RowDataPacket[0];
    const userInfo = (await userService.getUserInfoByUsername(username))[0];
    if (existingAds.user_id !== userInfo.user_id) {
      ctx.body = {
        success: false,
        message: "This ads belongs to another user"
      };
      return;
    }

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
    const { adsService, userService } = ServicesContext.getInstance();

    const RowDataPacket = await adsService.findAdsById(id);
    if (RowDataPacket.length == 0) {
      ctx.body = {
        success: false,
        message: "Ads doesn't exist"
      };
      return;
    }
    const existingAds = RowDataPacket[0];
    const userInfo = (await userService.getUserInfoByUsername(username))[0];
    if (existingAds.user_id !== userInfo.user_id) {
      ctx.body = {
        success: false,
        message: "This ads belongs to another user"
      };
      return;
    }

    await adsService.requestAds(id, userInfo.user_id, impressions);
    ctx.body = {
      success: true,
      message: "Successfully requested"
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

const generateFileName = (username, fileType) => {
  return `ads/ads-${username}-${moment().utc().unix()}.${mime.extension(fileType)}`;
};