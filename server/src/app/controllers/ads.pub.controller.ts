import * as mime from "mime-types";
import * as moment from "moment";
import * as aws from "../utils/aws";
import { ParameterizedContext } from "koa";
import { ServicesContext, CMCContext, RainContext, TransactionContext } from "../context";
import { Ads, User, Transaction, InnerTransaction } from "../models";
import configs from "@configs";
import { socketServer } from "../socket/app.socket";
import { shareRevenue } from "../utils/utils";

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
    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }

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
    const insertAds: Ads = await adsService.findAdsById(res.insertId);
    ctx.body = {
      success: true,
      message: "Successfully Created.",
      ads: insertAds
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
    const updatedAds: Ads = await adsService.findAdsById(adsId);
    ctx.body = {
      success: true,
      message: "Successfully Updated.",
      ads: updatedAds,
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

    const { existingAds } = checkResult;
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

    const { existingAds } = checkResult;
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
    const updatedAds: Ads = await adsService.findAdsById(adsId);
    ctx.body = {
      success: true,
      message: "Successfully requested",
      ads: updatedAds,
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
    const updatedAds: Ads = await adsService.findAdsById(adsId);
    ctx.body = {
      success: true,
      message: "Successfully canceled.",
      ads: updatedAds
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
    const { adsService, transactionService } = ServicesContext.getInstance();
    const { impressions, costPerImp, expectAmount } = ctx.request.body;

    const checkResult = await checkAdsId(username, adsId);
    if (checkResult.success === false) {
      ctx.body = checkResult;
      return;
    }

    const { existingAds } = checkResult;
    if (existingAds.status !== Ads.STATUS.Approved) {
      ctx.body = {
        success: false,
        message: "This ads is not approved."
      };
      return;
    }

    const adsTransactionDetails = {
      adsId,
      impressions,
      costPerImp,
    };
    const transInfo = await transactionService.createTransactionRequest(existingAds.userId, Transaction.TYPE.ADS, expectAmount, JSON.stringify(adsTransactionDetails));

    // Expire ads after 5 mins when it is still in pending purchase
    setTimeout(async () => {
      const ads: Ads = await adsService.findAdsById(adsId);
      if (ads.status === Ads.STATUS.PendingPurchase) {
        await adsService.updateStatus(adsId, Ads.STATUS.Approved);
        await socketServer.updateAdsStatus(adsId);
      }
      TransactionContext.getInstance().expireTransactionRequest(transInfo.insertId);
    }, configs.transactionTimeout); // 5 mins

    // Test -> Share revenue at this point | Move to wallet controller later
    await confirmAds(adsId, expectAmount, existingAds.type);
    // Save transaction info
    // =====================

    const updatedAds: Ads = await adsService.findAdsById(adsId);
    ctx.body = {
      success: true,
      message: "Successfully requested.",
      ads: updatedAds,
      expireTime: configs.transactionTimeout,
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
    const { adsService } = ServicesContext.getInstance();

    const ads: Ads = await adsService.findAdsToCampaign(Ads.TYPE.StaticAds);
    if (ads === undefined) {
      ctx.body = {
        success: false,
        message: "No static ads."
      };
      return;
    }
    await adsService.consumeImpression(ads.id, 1);
    ctx.body = {
      success: true,
      ads,
      duration: configs.ads.static_ads_interval
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

const confirmAds = async (adsId: number, paidAmount: number, type: number) => {
  const { adsService, transactionService } = ServicesContext.getInstance();

  // Update Ads Status
  const existingAds = await adsService.findAdsById(adsId);
  const tran: Transaction[] = await transactionService.getLastPendingTransaction(existingAds.userId, Transaction.TYPE.ADS);
  if (tran.length === 0)
    return;

  // Update Transaction Table
  const adsDetails = JSON.parse(tran[0].details);
  const realCostPerImp = configs.ads.revenue.imp_revenue * adsDetails.costPerImp;
  await adsService.setImpressions(adsId, existingAds.userId, adsDetails.impressions, realCostPerImp, paidAmount);
  await transactionService.confirmTransactionRequest(existingAds.userId, Transaction.TYPE.ADS, paidAmount, moment().utc().unix());

  // Revenue Share Model
  // ===== Company Share ===== //
  // 25% | Company Revenue
  // ---------------------------------
  // 20% -----> Company Expenses
  // 30% -----> Owner Share
  // 25% -----> Moderator Share
  // 25% -----> Membership Users Share
  const companyRevenue = paidAmount * configs.ads.revenue.company_revenue;
  const companyExpense = companyRevenue * configs.company_revenue.company_expenses;
  const ownerShare = companyRevenue * configs.company_revenue.owner_share;
  const moderatorShare = companyRevenue * configs.company_revenue.moderator_share;
  const membersShare = companyRevenue * configs.company_revenue.membership_share;

  await shareRevenue(companyExpense, User.ROLE.COMPANY, InnerTransaction.TYPE.ADS_PURCHASE_SHARE);
  await shareRevenue(ownerShare, User.ROLE.OWNER, InnerTransaction.TYPE.ADS_PURCHASE_SHARE);
  await shareRevenue(moderatorShare, User.ROLE.MODERATOR, InnerTransaction.TYPE.ADS_PURCHASE_SHARE);
  await shareRevenue(membersShare, User.ROLE.UPGRADED_USER, InnerTransaction.TYPE.ADS_PURCHASE_SHARE);

  // ===== Rain Rest ===== //
  // 75% | Ads Operation
  // ---------------------------------
  // Rain Room Ads -> buy impressions
  // Static Ads -> Rain Last 200 Users
  if (type === Ads.TYPE.StaticAds) {
    const restShare = paidAmount - companyRevenue;
    RainContext.getInstance().rainUsersByLastActivity(restShare);
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

const generateFileName = (username, fileType) => {
  return `campaign/campaign-${username}-${moment().utc().unix()}.${mime.extension(fileType)}`;
};