import * as mime from "mime-types";
import * as moment from "moment";
import * as aws from "../utils/aws";
import { ServicesContext } from "../context";

export const registerAds = async (ctx, next) => {
  try {
    const { username } = ctx.params;
    const { impressions, link, buttonName, title, description } = ctx.request.body;
    const asset = ctx.request.files.asset;
    const { userService, adsService } = ServicesContext.getInstance();

    // Check Username
    const RowDataPacket = await userService.findUserByUsername(username);
    if (RowDataPacket.length <= 0) {
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }
    const userInfo = RowDataPacket[0];

    // Upload Asset
    const fileName = `ads/ads-${username}-${moment().utc().unix()}.${mime.extension(asset.type)}`;
    const { url } = await aws.uploadFile({
      fileName: fileName,
      filePath: asset.path,
      fileType: asset.type,
    });
    console.log(url);

    // Register DB
    await adsService.insertAds({
      user_id: userInfo.id,
      asset_link: url,
      impressions,
      link,
      button_name: buttonName,
      title,
      description,
      time: moment().utc().unix()
    });

    ctx.body = {
      success: true,
      message: "Successfully Added."
    };
  } catch (error) {
    console.log(error.message);
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
    const RowDataPacket = await userService.findUserByUsername(username);
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
    console.log(error.message);
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
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};