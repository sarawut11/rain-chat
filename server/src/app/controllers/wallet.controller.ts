import { ServicesContext, RainContext, TransactionContext } from "@context";
import { now, rpcInterface, shareRevenue } from "@utils";
import { updateBalanceSocket, updateAdsStatus } from "@sockets";
import {
  Ads,
  User,
  Transaction,
  InnerTransaction,
  TransactionDetail,
  WalletNotify,
  WalletNotifyDetail,
  AllSetting,
} from "@models";

const COMPANY_USERID: number = Number(process.env.COMPANY_USERID);
const COMPANY_RAIN_ADDRESS = process.env.COMPANY_RAIN_ADDRESS;
const COMPANY_STOCKPILE_USERID: number = Number(process.env.COMPANY_STOCKPILE_USERID);
const COMPANY_STOCKPILE_ADDRESS = process.env.COMPANY_STOCKPILE_ADDRESS;

export const walletNotify = async (ctx, next) => {
  try {
    const { txid } = ctx.request.body;
    const { userService, transactionService } = ServicesContext.getInstance();

    const txInfo: WalletNotify = await rpcInterface.getTransaction(txid);
    console.log("Transaction Notify => ", txInfo);

    if (txInfo.confirmations > 0) { // Confirmed
      if (txInfo.details[0].category === WalletNotifyDetail.CATEGORY.receive) {
        const receiveAddress = txInfo.details[0].address;
        if (receiveAddress === COMPANY_RAIN_ADDRESS) {
          console.log("Transaction Notify => Send Vitae To Rain | Amount:", txInfo.amount);
          await confirmSendVitaePurchase(txInfo.amount, txid, txInfo.timereceived);
          ctx.body = {
            success: true,
            message: "Success"
          };
          return;
        }
        if (receiveAddress === COMPANY_STOCKPILE_ADDRESS) {
          console.log("Transaction Notify => Stockpile Rain | Deposit Amount:", txInfo.amount);
          await confirmStockpileCharge(txInfo.amount, txid, txInfo.timereceived);
          ctx.body = {
            success: true,
            message: "Success"
          };
          return;
        }

        const userInfo: User = await userService.findUserByWalletAddress(receiveAddress);
        if (userInfo === undefined) {
          console.log("Transaction Notify => Failed | Deposit from unknown user. | txId:", txid);
          ctx.body = {
            success: false,
            message: "Failed"
          };
          return;
        }

        const tranInfo: Transaction = await transactionService.getLastRequestedTransaction(userInfo.id);
        if (tranInfo === undefined) {
          console.log(`Transaction Notify => Failed | Unknown deposit from user:${userInfo.id}, txId:${txid}`);
          ctx.body = {
            success: false,
            message: "Failed"
          };
          return;
        }

        if (txInfo.amount < tranInfo.expectAmount) {
          console.log(`Transaction Notify => Insufficient Amount | expectAmount:${tranInfo.expectAmount}, paidAmount:${txInfo.amount}, txId:${txid}`);
          await transactionService.setInsufficientTransaction(txid, txInfo.amount, txInfo.timereceived, tranInfo);
        } else {
          TransactionContext.getInstance().confrimTransactionRequest(tranInfo.id, txid, txInfo.amount, txInfo.timereceived);
          if (tranInfo.type === Transaction.TYPE.MEMBERSHIP) {
            console.log(`Transaction Notify => Membership Upgraded | username:${userInfo.username}, txId:${txid}`);
            await confirmMembership(userInfo, txInfo.amount);
          } else if (tranInfo.type === Transaction.TYPE.ADS) {
            const details: TransactionDetail = JSON.parse(tranInfo.details);
            console.log(`Transaction Notify => Ads Purchased | username:${userInfo.username}, adsId:${details.adsId} txId:${txid}`);
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
    console.log(`Transaction Notify => Failed | Error:${error.message}`);
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
      console.log(`Wallet Withdraw => Failed | Invalid username: ${username}`);
      ctx.body = {
        success: false,
        message: "Invalid username"
      };
      return;
    }

    const isAddressValid = await rpcInterface.validateAddress(walletAddress);
    if (!isAddressValid) {
      console.log(`Wallet Withdraw => Failed | Invalid wallet address: ${walletAddress}, Username:${username}`);
      ctx.body = {
        success: false,
        message: "Invalid wallet address"
      };
      return;
    }

    if (amount > userInfo.balance) {
      console.log(`Wallet Withdraw => Failed | Insufficient balance:${userInfo.balance}, withdraw:${amount}, username: ${username}`);
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
    updateBalanceSocket(updatedUser);

    ctx.body = {
      success: true,
      message: "Success",
      userInfo: updatedUser
    };
    console.log(`Wallet Withdraw => Success | Updated balance:${userInfo.balance}, withdraw:${amount}, username: ${username}`);
  } catch (error) {
    console.log(`Wallet Withdraw => Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const getPendingTransaction = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, transactionService } = ServicesContext.getInstance();

    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      console.log(`Get Pending Tran => Failed | Invalid username: ${username}`);
      ctx.body = {
        success: false,
        message: "Invalid username"
      };
      return;
    }

    const pendingTran = await transactionService.getLastRequestedTransaction(userInfo.id);
    if (pendingTran === undefined) {
      ctx.body = {
        success: true,
        message: "No pending transaction."
      };
    } else {
      const adsId = pendingTran.details === "" ? undefined : JSON.parse(pendingTran.details).adsId;
      ctx.body = {
        success: true,
        message: "Pending Transaction",
        pendingTran: {
          ...pendingTran,
          adsId,
        },
        walletAddress: userInfo.walletAddress
      };
    }
  } catch (error) {
    console.log("Get Pending Tran => Failed | Error:", error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const confirmMembership = async (userInfo: User, amount: number) => {
  const { userService, settingService } = ServicesContext.getInstance();
  const settings = await settingService.getAllSettings();

  // Update UserInfo
  await userService.updateMembership(userInfo.id, User.ROLE.UPGRADED_USER);

  // Revenue Share Model
  // ===== Company Share ===== //
  // 14.99 -> 4.99 | Company Revenue
  // ---------------------------------
  // 20% -----> Company Expenses
  // 30% -----> Owner Share
  // 25% -----> Moderator Share
  // 25% -----> Membership Users Share
  const companyRevenue = amount * settings.MEMBERSHIP_REV_COMPANY_SHARE;
  const rev = getCompanyRevenue(companyRevenue, settings);

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
  const sponsorRevenue = amount * settings.MEMBERSHIP_REV_SPONSOR_SHARE;
  const firstSponsorShare = sponsorRevenue * settings.SPONSOR_SHARE_FIRST;
  const secondSponsorShare = sponsorRevenue * settings.SPONSOR_SHARE_SECOND;
  const thirdSponsorShare = sponsorRevenue * settings.SPONSOR_SHARE_THIRD;

  const firstSponsor = await userService.findUserById(userInfo.sponsor);
  const secondSponsor = await userService.findUserById(firstSponsor.sponsor);
  const thirdSponsor = await userService.findUserById(secondSponsor.sponsor);
  await addSponsorBalance(firstSponsor, firstSponsorShare);
  await addSponsorBalance(secondSponsor, secondSponsorShare);
  await addSponsorBalance(thirdSponsor, thirdSponsorShare);

  // ===== Rain Rest ===== //
  // 14.99 -> 5 | Rain Last 200 Users
  const restShare = amount - sponsorRevenue - companyRevenue;
  RainContext.getInstance().rainUsersByLastActivity(restShare);
  console.log(`Transaction Notify => Membership Upgrade Success | Revenue shared, rain rest:${restShare}`);
};

const addSponsorBalance = async (sponsor: User, amount: number) => {
  const { userService } = ServicesContext.getInstance();
  await userService.addBalance(sponsor.id, amount);
  const updatedSponsor = await userService.findUserById(sponsor.id);
  updateBalanceSocket(updatedSponsor);
};

const confirmAds = async (adsId: number, paidAmount: number, adsType: number, impressions: number, costPerImp: number) => {
  const { adsService, settingService } = ServicesContext.getInstance();
  const settings = await settingService.getAllSettings();

  // Update Ads Status
  const existingAds = await adsService.findAdsById(adsId);
  if (existingAds === undefined) {
    console.log(`Transaction Notify => Confirm Ads Failed | Unknown adsId:${adsId}`);
    return;
  }

  // Set Ads Impressions
  const realCostPerImp = settings.ADS_REV_IMP_REVENUE * costPerImp;
  await adsService.setImpressions(adsId, existingAds.userId, impressions, realCostPerImp, paidAmount);
  const updatedAds = await adsService.findAdsById(adsId);
  await updateAdsStatus(updatedAds);

  // Revenue Share Model
  // ===== Company Share ===== //
  // 25% | Company Revenue
  // ---------------------------------
  // 20% -----> Company Expenses
  // 30% -----> Owner Share
  // 25% -----> Moderator Share
  // 25% -----> Membership Users Share
  const companyRevenue = paidAmount * settings.ADS_REV_COMPANY_SHARE;
  const rev = getCompanyRevenue(companyRevenue, settings);

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
    console.log(`Transaction Notify => Ads Purchase Success | Revenue shared, rain rest:${restShare}`);
  }
};

const confirmSendVitaePurchase = async (amount: number, txId: string, confirmTime: number) => {
  // Record Transaction
  const { transactionService } = ServicesContext.getInstance();
  const requestInfo = await transactionService.createTransactionRequest(COMPANY_USERID, Transaction.TYPE.VITAE_RAIN, amount);
  await transactionService.confirmTransaction(requestInfo.insertId, txId, amount, confirmTime);

  // Rain purchased amount to last active users
  RainContext.getInstance().rainUsersByLastActivity(amount);
  console.log(`Transaction Notify => Send Vitae Rain Success | Rain:${amount}`);
};

const confirmStockpileCharge = async (amount: number, txId: string, confirmTime: number) => {
  // Record Transaction
  const { userService, transactionService } = ServicesContext.getInstance();
  const requestInfo = await transactionService.createTransactionRequest(COMPANY_STOCKPILE_USERID, Transaction.TYPE.STOCKPILE_RAIN, amount);
  await transactionService.confirmTransaction(requestInfo.insertId, txId, amount, confirmTime);

  // Add Stockpile balance
  await userService.addBalance(COMPANY_STOCKPILE_USERID, amount);
};

const getCompanyRevenue = (revenue: number, settings: AllSetting) => {
  return {
    companyExpense: revenue * settings.COMPANY_REV_COMPANY_EXPENSE,
    ownerShare: revenue * settings.COMPANY_REV_OWNER_SHARE,
    moderatorShare: revenue * settings.COMPANY_REV_MODER_SHARE,
    memberShare: revenue * settings.COMPANY_REV_MEMBER_SHARE,
  };
};