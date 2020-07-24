import { ParameterizedContext } from "koa";
import { ServicesContext, CMCContext, TransactionContext } from "@context";
import { Ads, User, Transaction, TransactionDetail, Setting } from "@models";
import { uploadFile, deleteFile, now } from "@utils";
import { updateAdsStatus } from "@sockets";

export const registerAds = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { link, buttonLabel, title, description, type } = ctx.request.body;
    const asset = ctx.request.files.asset;
    const { userService, adsService } = ServicesContext.getInstance();

    if (asset === undefined) {
      console.log(`Register Ads => Failed | Empty Asset | Creator:${username}`);
      ctx.body = {
        success: false,
        message: "Attach a video or an image and try again."
      };
      return;
    }

    // Check Username
    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      console.log(`Register Ads => Failed | Invalid username:${username}`);
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }

    if (userInfo.role === User.ROLE.MODERATOR) {
      console.log(`Register Ads => Failed | Moderator can't create ads | username:${username}`);
      ctx.body = {
        success: false,
        message: "Invalid Role."
      };
      return;
    }

    // Upload Asset
    const fileName = generateFileName(username);
    const { url } = await uploadFile({
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
      time: now(),
      type
    });
    const insertAds: Ads = await adsService.findAdsById(res.insertId);
    console.log(`Register Ads => Success | Creator:${username}`);

    ctx.body = {
      success: true,
      message: "Successfully Created.",
      ads: insertAds
    };
  } catch (error) {
    console.log(`Register Ads => Failed | Error:${error.message}`);
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
    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }

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

    const { existingAds } = checkResult;

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
    const { adsService } = ServicesContext.getInstance();

    const checkResult = await checkAdsId(username, adsId);
    if (checkResult.success === false) {
      console.log(`Update Ads => Failed | ${checkResult.message} | username:${username}, adsId:${adsId}`);
      ctx.body = checkResult;
      return;
    }

    const { userInfo, existingAds } = checkResult;
    if (existingAds.status !== Ads.STATUS.Created && existingAds.status !== Ads.STATUS.Rejected) {
      console.log(`Update Ads => Failed | Invalid status | username:${username}, adsId:${adsId}`);
      ctx.body = {
        success: false,
        message: "You can't modify ads for now."
      };
      return;
    }

    // Delete existing asset and upload new asset
    let assetLink: string;
    if (asset !== undefined) {
      await deleteFile(existingAds.assetLink);
      const { url } = await uploadFile({
        fileName: generateFileName(username),
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
    const updatedAds: Ads = await adsService.findAdsById(adsId);
    console.log(`Update Ads => Success | adsId:${adsId}, creator:${username}`);

    ctx.body = {
      success: true,
      message: "Successfully Updated.",
      ads: updatedAds,
    };
  } catch (error) {
    console.log(`Update Ads => Failed | Error:${error.message}`);
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

    const { existingAds } = checkResult;
    await deleteFile(existingAds.assetLink);
    await adsService.deleteAds(adsId);
    console.log(`Delete Ads => Success | adsId:${adsId}, creator:${username}`);
    ctx.body = {
      success: true,
      message: "Successfully Deleted."
    };
  } catch (error) {
    console.log(`Delete Ads => Failed | Error:${error.message}`);
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
      console.log(`Request Ads => Failed | Already in pending | adsId:${adsId}`);
      ctx.body = {
        success: false,
        message: "This ads is already in pending."
      };
      return;
    }
    if (existingAds.status === Ads.STATUS.Approved) {
      console.log(`Request Ads => Failed | Already approved | adsId:${adsId}`);
      ctx.body = {
        success: false,
        message: "This ads is already approved."
      };
      return;
    }

    if (userInfo.role === User.ROLE.OWNER) {
      await adsService.updateStatus(adsId, Ads.STATUS.Approved);
    } else {
      await adsService.updateStatus(adsId, Ads.STATUS.Pending);
    }
    const updatedAds: Ads = await adsService.findAdsById(adsId);
    await updateAdsStatus(updatedAds);
    console.log(`Request Ads => Success | In pending for review | adsId:${adsId}`);

    ctx.body = {
      success: true,
      message: "Successfully requested",
      ads: updatedAds,
    };
  } catch (error) {
    console.log(`Request Ads => Failed | Error:${error.message}`);
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
      console.log(`Cancel Ads => Failed | Not in pending | adsId:${adsId}`);
      ctx.body = {
        success: false,
        message: "This ads is not in pending."
      };
      return;
    }

    await adsService.cancelAds(adsId, userInfo.id);
    const updatedAds: Ads = await adsService.findAdsById(adsId);
    await updateAdsStatus(updatedAds);
    console.log(`Cancel Ads => Success | adsId:${adsId}`);

    ctx.body = {
      success: true,
      message: "Successfully canceled.",
      ads: updatedAds
    };
  } catch (error) {
    console.log(`Cancel Ads => Failed | Error:${error.message}`);
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
    const { adsService, transactionService, settingService } = ServicesContext.getInstance();
    const { impressions, costPerImp, expectAmount } = ctx.request.body;

    const checkResult = await checkAdsId(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { existingAds } = checkResult;
    if (existingAds.status !== Ads.STATUS.Approved) {
      console.log(`Purchase Ads => Failed | Not approved | adsId:${adsId}`);
      ctx.body = {
        success: false,
        message: "This ads is not approved."
      };
      return;
    }

    const adsTransactionDetails = new TransactionDetail({
      adsId,
      impressions,
      costPerImp,
      adsType: existingAds.type
    });
    const transInfo = await transactionService.createTransactionRequest(existingAds.userId, Transaction.TYPE.ADS, expectAmount, adsTransactionDetails);
    if (transInfo === undefined) {
      console.log(`Purchase Ads => Failed | Still have incompleted transaction | adsId:${adsId}, username:${username}`);
      ctx.body = {
        success: false,
        message: "You still have incompleted transaction requests."
      };
      return;
    }

    // Expire ads after 5 mins when it is still in pending purchase
    const tranExpire: number = await settingService.getSettingValue(Setting.KEY.TRANSACTION_REQUEST_EXPIRE);
    setTimeout(async () => {
      const ads: Ads = await adsService.findAdsById(adsId);
      if (ads.status === Ads.STATUS.PendingPurchase) {
        await adsService.updateStatus(adsId, Ads.STATUS.Approved);
        await updateAdsStatus(ads);
        console.log(`Purchase Ads => Expired | Restore status to approved | adsId:${adsId}`);
      }
      TransactionContext.getInstance().expireTransactionRequest(transInfo.insertId);
    }, tranExpire);

    await adsService.updateStatus(adsId, Ads.STATUS.PendingPurchase);
    const updatedAds: Ads = await adsService.findAdsById(adsId);
    await updateAdsStatus(updatedAds);
    console.log(`Purchase Ads => Success | In pending | adsId:${adsId}, username:${username}`);
    ctx.body = {
      success: true,
      message: "Successfully requested.",
      ads: updatedAds,
      expireTime: tranExpire,
    };
  } catch (error) {
    console.log(`Purchase Ads => Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const getCostPerImpression = async (ctx: ParameterizedContext, next) => {
  try {
    const { type } = ctx.request.query;
    const { settingService } = ServicesContext.getInstance();

    // $1 === 2000 | 1000 impressions
    // 25% -> Company Revenue
    // 75% -> Buy Impressions
    const costPerImpRainAds: number = await settingService.getSettingValue(Setting.KEY.COST_PER_IMPRESSION_RAIN_ADS);
    const costPerImpStaticAds: number = await settingService.getSettingValue(Setting.KEY.COST_PER_IMPRESSION_STATIC_ADS);
    const adsRevImpRevenue: number = await settingService.getSettingValue(Setting.KEY.ADS_REV_IMP_REVENUE);

    const vitaePrice = CMCContext.getInstance().vitaePriceUSD();
    const usdPerImp = Number(type) === Ads.TYPE.RainRoomAds ? costPerImpRainAds : costPerImpStaticAds;
    const vitaePerImp = (usdPerImp / vitaePrice) * (1 / adsRevImpRevenue);
    ctx.body = {
      success: true,
      message: "Success",
      price: vitaePerImp
    };
  } catch (error) {
    console.log(`Get ImpCost => Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const getStaticAds = async (ctx: ParameterizedContext, next) => {
  try {
    const { adsService, settingService } = ServicesContext.getInstance();

    const ads: Ads = await adsService.findAdsToCampaign(Ads.TYPE.StaticAds);
    if (ads === undefined) {
      console.log(`Get Static Ads => Failed | No static ads`);
      ctx.body = {
        success: false,
        message: "No static ads."
      };
      return;
    }
    await adsService.consumeImpression(ads.id, 1);
    const duration: number = await settingService.getSettingValue(Setting.KEY.RAIN_ADS_DURATION);
    ctx.body = {
      success: true,
      ads,
      duration
    };
  } catch (error) {
    console.log(`Get Static Ads => Failed | Error:${error.message}`);
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
  const existingAds = await adsService.findAdsById(adsId);
  if (existingAds === undefined) {
    resolve({
      success: false,
      message: "Ads doesn't exist"
    });
    return;
  }
  const userInfo: User = await userService.findUserByUsername(username);
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

const generateFileName = (username) => {
  return `campaign/campaign-${username}-${now()}.png`;
};