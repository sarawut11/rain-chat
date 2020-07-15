import * as moment from "moment";
import configs from "@configs";
import { rpcInterface } from "../utils/wallet/RpcInterface";
import { ServicesContext, RainContext } from "../context";
import { User, Transaction, InnerTransaction, Ads, TransactionDetail, WalletNotify, WalletNotifyDetail } from "../models";
import { shareRevenue } from "../utils";

export const walletNotify = async (ctx, next) => {
  // ====== Update Transaction Info =====
  // amount: txInfo.amount
  // confirmations: txInfo.confirmations
  // category: txInfo.details[0].category => "send" | "receive"
  // receiveAddress: txInfo.details[0].address when category == "receive"
  // We don't need to consider about send category
  // Find who owns the receive address
  // Check transaction table if the owner requested purchase
  // Get purchase type, amount from the table
  // Compare purchase amount and actual amount
  // If actual amount >= purchase amount, update db and transaction table according to the purchase type
  // If actual amount < purchase amount, update proper transaction table record to show "insufficient tokens, contact support" in frontend
  try {
    const { txid } = ctx.request.body;
    const { userService, transactionService } = ServicesContext.getInstance();

    const txInfo: WalletNotify = await rpcInterface.getTransaction(txid);
    console.log("Transaction Notify => ", txInfo);

    if (txInfo.confirmations > 0) {
      if (txInfo.details[0].category === WalletNotifyDetail.CATEGORY.receive) {
        const receiveAddress = txInfo.details[0].address;
        if (receiveAddress === configs.companyRainAddress) {
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
    await transactionService.confirmTransaction(requestInfo.insertId, "", amount, moment().utc().unix());

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
  const companyRevenue = amount * configs.membership.revenue.company_revenue;
  const companyExpense = companyRevenue * configs.company_revenue.company_expenses;
  const ownerShare = companyRevenue * configs.company_revenue.owner_share;
  const moderatorShare = companyRevenue * configs.company_revenue.moderator_share;
  const membersShare = companyRevenue * configs.company_revenue.membership_share;

  await shareRevenue(companyExpense, User.ROLE.COMPANY, InnerTransaction.TYPE.MEMBERSHIP_PURCHASE_SHARE);
  await shareRevenue(ownerShare, User.ROLE.OWNER, InnerTransaction.TYPE.MEMBERSHIP_PURCHASE_SHARE);
  await shareRevenue(moderatorShare, User.ROLE.MODERATOR, InnerTransaction.TYPE.MEMBERSHIP_PURCHASE_SHARE);
  await shareRevenue(membersShare, User.ROLE.UPGRADED_USER, InnerTransaction.TYPE.MEMBERSHIP_PURCHASE_SHARE);

  // ====== Sponsor Share ===== //
  // 14.99 -> 5 | Sponsor Revenue
  // ---------------------------------
  // 50% -----> First Sponsor
  // 25% -----> Second Sponsor (first sponsor's sponsor)
  // 25% -----> Third Sponsor (second sponsor's sponsor)
  const sponsorRevenue = amount * configs.membership.revenue.sponsor_revenue;
  const firstSponsorShare = sponsorRevenue * configs.membership.revenue.sponsor_1_rate;
  const secondSponsorShare = sponsorRevenue * configs.membership.revenue.sponsor_2_rate;
  const thirdSponsorShare = sponsorRevenue * configs.membership.revenue.sponsor_3_rate;

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
  const realCostPerImp = configs.ads.revenue.imp_revenue * costPerImp;
  await adsService.setImpressions(adsId, existingAds.userId, impressions, realCostPerImp, paidAmount);

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
  if (adsType === Ads.TYPE.StaticAds) {
    const restShare = paidAmount - companyRevenue;
    RainContext.getInstance().rainUsersByLastActivity(restShare);
  }
};

const confirmSendVitaePurchase = async (amount: number, txId: string, confirmTime: number) => {
  // Record Transaction
  const { transactionService } = ServicesContext.getInstance();
  const requestInfo = await transactionService.createTransactionRequest(configs.companyUserId, Transaction.TYPE.VITAE_RAIN, amount);
  await transactionService.confirmTransaction(requestInfo.insertId, txId, amount, confirmTime);

  // Rain purchased amount to last active users
  await RainContext.getInstance().rainUsersByLastActivity(amount);
};