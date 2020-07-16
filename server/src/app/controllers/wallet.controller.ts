import { ServicesContext, RainContext } from "../context";
import { User, Transaction, InnerTransaction, Ads, TransactionDetail, WalletNotify, WalletNotifyDetail } from "../models";
import { now, rpcInterface, shareRevenue } from "../utils";
import { socketServer } from "../socket/app.socket";

const COMPANY_USERID: number = Number(process.env.COMPANY_USERID);
const COMPANY_RAIN_ADDRESS = process.env.COMPANY_RAIN_ADDRESS;
const COMPANY_REV_COMPANY_EXPENSE = Number(process.env.COMPANY_REV_COMPANY_EXPENSE);
const COMPANY_REV_OWNER_SHARE = Number(process.env.COMPANY_REV_OWNER_SHARE);
const COMPANY_REV_MODER_SHARE = Number(process.env.COMPANY_REV_MODER_SHARE);
const COMPANY_REV_MEMBER_SHARE = Number(process.env.COMPANY_REV_MEMBER_SHARE);

const MEMBERSHIP_REV_COMPANY_SHARE = Number(process.env.MEMBERSHIP_REV_COMPANY_SHARE);
const MEMBERSHIP_REV_SPONSOR_SHARE = Number(process.env.MEMBERSHIP_REV_SPONSOR_SHARE);
const SPONSOR_SHARE_FIRST = Number(process.env.SPONSOR_SHARE_FIRST);
const SPONSOR_SHARE_SECOND = Number(process.env.SPONSOR_SHARE_SECOND);
const SPONSOR_SHARE_THIRD = Number(process.env.SPONSOR_SHARE_THIRD);

const ADS_REV_COMPANY_SHARE = Number(process.env.ADS_REV_COMPANY_SHARE);
const ADS_REV_IMP_REVENUE = Number(process.env.ADS_REV_IMP_REVENUE);

export const walletNotify = async (ctx, next) => {
  try {
    const { txid } = ctx.request.body;
    const { userService, transactionService } = ServicesContext.getInstance();

    const txInfo: WalletNotify = await rpcInterface.getTransaction(txid);
    console.log("Transaction Notify => ", txInfo);

    if (txInfo.confirmations > 0) {
      if (txInfo.details[0].category === WalletNotifyDetail.CATEGORY.receive) {
        const receiveAddress = txInfo.details[0].address;
        if (receiveAddress === COMPANY_RAIN_ADDRESS) {
          await confirmSendVitaePurchase(txInfo.amount, txid, txInfo.timereceived);
          ctx.body = {
            success: true,
            message: "Success"
          };
          return;
        }

        const userInfo: User = await userService.findUserByWalletAddress(receiveAddress);
        if (userInfo === undefined) {
          console.log("Transasction Notify => Deposit from unknown user");
          ctx.body = {
            success: false,
            message: "Failed"
          };
          return;
        }

        const tranInfo: Transaction = await transactionService.getLastRequestedTransaction(userInfo.id);
        if (tranInfo === undefined) {
          console.log(`Transaction Notify => Unknown deposit from user:${userInfo.id}`);
          ctx.body = {
            success: false,
            message: "Failed"
          };
          return;
        }

        if (txInfo.amount < tranInfo.expectAmount) {
          await transactionService.setInsufficientTransaction(txid, txInfo.amount, txInfo.timereceived, tranInfo);
        } else {
          await transactionService.confirmTransaction(tranInfo.id, txid, txInfo.amount, txInfo.timereceived);
          if (tranInfo.type === Transaction.TYPE.MEMBERSHIP) {
            await confirmMembership(userInfo, txInfo.amount);
          } else if (tranInfo.type === Transaction.TYPE.ADS) {
            const details: TransactionDetail = JSON.parse(tranInfo.details);
            await confirmAds(details.adsId, txInfo.amount, details.adsType, details.impressions, details.costPerImp);
          }
        }
      } else if (txInfo.details[0].category === WalletNotifyDetail.CATEGORY.send) {
        // Withdraw Notify
        console.log("Transaction Notify => Withdraw sent");
      }
    } else {
      console.log("Transaction Notify => Confirmation: 0");
    }
    ctx.body = {
      success: true,
      message: "Success",
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const walletWithdraw = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { walletAddress, amount } = ctx.request.body;
    const { userService, transactionService } = ServicesContext.getInstance();

    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      ctx.body = {
        success: false,
        message: "Invalid username"
      };
      return;
    }

    const isAddressValid = await rpcInterface.validateAddress(walletAddress);
    if (!isAddressValid) {
      ctx.body = {
        success: false,
        message: "Invalid wallet address"
      };
      return;
    }

    if (amount > userInfo.balance) {
      ctx.body = {
        success: false,
        message: "Insufficient balance"
      };
      return;
    }

    await rpcInterface.sendToAddress(walletAddress, amount);
    const requestInfo = await transactionService.createTransactionRequest(userInfo.id, Transaction.TYPE.WITHDRAW, amount);

    // Descrese balance | Move it to wallet notify later
    await userService.addBalance(userInfo.id, -amount);
    const updatedUser: User = await userService.findUserByUsername(username);
    await transactionService.confirmTransaction(requestInfo.insertId, "", amount, now());

    ctx.body = {
      success: true,
      message: "Success",
      userInfo: updatedUser
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};


const confirmMembership = async (userInfo: User, amount: number) => {
  const { userService } = ServicesContext.getInstance();

  // Update UserInfo & Transaction Info
  await userService.updateMembership(userInfo.id, User.ROLE.UPGRADED_USER);

  // Revenue Share Model
  // ===== Company Share ===== //
  // 14.99 -> 4.99 | Company Revenue
  // ---------------------------------
  // 20% -----> Company Expenses
  // 30% -----> Owner Share
  // 25% -----> Moderator Share
  // 25% -----> Membership Users Share
  const companyRevenue = amount * MEMBERSHIP_REV_COMPANY_SHARE;
  const rev = getCompanyRevenue(companyRevenue);

  await shareRevenue(rev.companyExpense, User.ROLE.COMPANY, InnerTransaction.TYPE.MEMBERSHIP_PURCHASE_SHARE);
  await shareRevenue(rev.ownerShare, User.ROLE.OWNER, InnerTransaction.TYPE.MEMBERSHIP_PURCHASE_SHARE);
  await shareRevenue(rev.moderatorShare, User.ROLE.MODERATOR, InnerTransaction.TYPE.MEMBERSHIP_PURCHASE_SHARE);
  await shareRevenue(rev.memberShare, User.ROLE.UPGRADED_USER, InnerTransaction.TYPE.MEMBERSHIP_PURCHASE_SHARE);

  // ====== Sponsor Share ===== //
  // 14.99 -> 5 | Sponsor Revenue
  // ---------------------------------
  // 50% -----> First Sponsor
  // 25% -----> Second Sponsor (first sponsor's sponsor)
  // 25% -----> Third Sponsor (second sponsor's sponsor)
  const sponsorRevenue = amount * MEMBERSHIP_REV_SPONSOR_SHARE;
  const firstSponsorShare = sponsorRevenue * SPONSOR_SHARE_FIRST;
  const secondSponsorShare = sponsorRevenue * SPONSOR_SHARE_SECOND;
  const thirdSponsorShare = sponsorRevenue * SPONSOR_SHARE_THIRD;

  const firstSponsorId = userInfo.sponsor;
  const secondSponsorId = (await userService.findUserById(firstSponsorId)).sponsor;
  const thirdSponsorId = (await userService.findUserById(secondSponsorId)).sponsor;
  await userService.addBalance(firstSponsorId, firstSponsorShare);
  await userService.addBalance(secondSponsorId, secondSponsorShare);
  await userService.addBalance(thirdSponsorId, thirdSponsorShare);

  // ===== Rain Rest ===== //
  // 14.99 -> 5 | Rain Last 200 Users
  const restShare = amount - sponsorRevenue - companyRevenue;
  RainContext.getInstance().rainUsersByLastActivity(restShare);
};


const confirmAds = async (adsId: number, paidAmount: number, adsType: number, impressions: number, costPerImp: number) => {
  const { adsService } = ServicesContext.getInstance();

  // Update Ads Status
  const existingAds = await adsService.findAdsById(adsId);
  if (existingAds === undefined) {
    console.log("Transaction Notify => Confirm Ads => Unknown ads");
    return;
  }

  // Set Ads Impressions
  const realCostPerImp = ADS_REV_IMP_REVENUE * costPerImp;
  await adsService.setImpressions(adsId, existingAds.userId, impressions, realCostPerImp, paidAmount);
  await socketServer.updateAdsStatus(adsId);

  // Revenue Share Model
  // ===== Company Share ===== //
  // 25% | Company Revenue
  // ---------------------------------
  // 20% -----> Company Expenses
  // 30% -----> Owner Share
  // 25% -----> Moderator Share
  // 25% -----> Membership Users Share
  const companyRevenue = paidAmount * ADS_REV_COMPANY_SHARE;
  const rev = getCompanyRevenue(companyRevenue);

  await shareRevenue(rev.companyExpense, User.ROLE.COMPANY, InnerTransaction.TYPE.ADS_PURCHASE_SHARE);
  await shareRevenue(rev.ownerShare, User.ROLE.OWNER, InnerTransaction.TYPE.ADS_PURCHASE_SHARE);
  await shareRevenue(rev.moderatorShare, User.ROLE.MODERATOR, InnerTransaction.TYPE.ADS_PURCHASE_SHARE);
  await shareRevenue(rev.memberShare, User.ROLE.UPGRADED_USER, InnerTransaction.TYPE.ADS_PURCHASE_SHARE);

  // ===== Rain Rest ===== //
  // 75% | Ads Operation
  // ---------------------------------
  // Rain Room Ads -> buy impressions
  // Static Ads -> Rain Last 200 Users
  if (adsType === Ads.TYPE.StaticAds) {
    const restShare = paidAmount - companyRevenue;
    RainContext.getInstance().rainUsersByLastActivity(restShare);
  }
};

const confirmSendVitaePurchase = async (amount: number, txId: string, confirmTime: number) => {
  // Record Transaction
  const { transactionService } = ServicesContext.getInstance();
  const requestInfo = await transactionService.createTransactionRequest(COMPANY_USERID, Transaction.TYPE.VITAE_RAIN, amount);
  await transactionService.confirmTransaction(requestInfo.insertId, txId, amount, confirmTime);

  // Rain purchased amount to last active users
  await RainContext.getInstance().rainUsersByLastActivity(amount);
};

const getCompanyRevenue = (revenue: number) => {
  return {
    companyExpense: revenue * COMPANY_REV_COMPANY_EXPENSE,
    ownerShare: revenue * COMPANY_REV_OWNER_SHARE,
    moderatorShare: revenue * COMPANY_REV_MODER_SHARE,
    memberShare: revenue * COMPANY_REV_MEMBER_SHARE,
  };
};