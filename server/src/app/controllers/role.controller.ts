import { ServicesContext } from "@context";
import { User, Transaction, Setting } from "@models";
import { checkUserInfo, isOwner, usdToVitae, now, roundPrice } from "@utils";
import { confirmMembership } from "@controllers";
import { updateBalanceSocket } from "@sockets";

export const getAllUsers = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const { role, name, email, username: searchUsername, searchString, page, count } = ctx.request.query;
    const users = await getUsersByRole(page, count, role, name, searchUsername, email, searchString);
    const totalCount = users.length === 0 ? 0 : users[0].totalCount;
    ctx.body = {
      success: true,
      totalCount,
      users
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const getMembershipPrice = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, settingService } = ServicesContext.getInstance();
    const userInfo: User = await userService.findUserByUsername(username);
    const membershipPriceUsd: number = await settingService.getSettingValue(Setting.KEY.MEMBERSHIP_PRICE_USD);
    const vitaePrice = roundPrice(usdToVitae(membershipPriceUsd));

    ctx.body = {
      success: true,
      vitaePrice,
      usdPrice: membershipPriceUsd,
      walletAddress: userInfo.walletAddress,
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const getMembershipPendingTran = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, transactionService, settingService } = ServicesContext.getInstance();

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
    if (pendingTran === undefined || pendingTran.type !== Transaction.TYPE.MEMBERSHIP) {
      ctx.body = {
        success: true,
        message: "No pending transaction."
      };
      return;
    }

    const membershipPriceUsd: number = await settingService.getSettingValue(Setting.KEY.MEMBERSHIP_PRICE_USD);
    const tranExpire: number = await settingService.getSettingValue(Setting.KEY.TRANSACTION_REQUEST_EXPIRE);
    const expireIn: number = pendingTran.time * 1000 + tranExpire - now() * 1000;
    ctx.body = {
      success: true,
      message: "Pending Transaction",
      walletAddress: userInfo.walletAddress,
      vitaePrice: pendingTran.expectAmount,
      usdPrice: membershipPriceUsd,
      expireIn,
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const upgradeMembershipPurchase = async (ctx, next) => {
  try {
    const { username, id: userId } = ctx.state.user;
    const { expectAmount } = ctx.request.body;
    const { transactionService, settingService } = ServicesContext.getInstance();

    const checkUser = await checkUserInfo(username);
    if (checkUser.success === false) {
      console.log(`Membership Purchase => Failed | ${checkUser.message} | username:${username}`);
      ctx.body = checkUser;
      return;
    }
    const { userInfo } = checkUser;
    if (userInfo.role === User.ROLE.OWNER || userInfo.role === User.ROLE.MODERATOR) {
      console.log(`Membership Purchase => Failed | Invalid Role | username:${username}`);
      ctx.body = {
        success: false,
        message: "You can't upgrade your membership."
      };
      return;
    }

    const tranExpire: number = await settingService.getSettingValue(Setting.KEY.TRANSACTION_REQUEST_EXPIRE);
    const transInfo = await transactionService.createTransactionRequest(userId, Transaction.TYPE.MEMBERSHIP, expectAmount);
    if (transInfo === undefined) {
      console.log(`Membership Purchase => Failed | Still have incompleted transaction | username:${username}`);
      ctx.body = {
        success: false,
        message: "You still have incompleted transaction requests."
      };
      return;
    }
    console.log(`Membership Purchase => Success | In pending | username:${username}`);

    ctx.body = {
      success: true,
      message: "Your membership request is in pending.",
      expireTime: tranExpire
    };
  } catch (error) {
    console.log(`Membership Purchase => Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const upgradeMembershipBalance = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { expectAmount } = ctx.request.body;
    const checkUser = await checkUserInfo(username);
    if (checkUser.success === false) {
      ctx.body = checkUser;
      return;
    }
    const { userInfo } = checkUser;
    if (userInfo.role === User.ROLE.OWNER || userInfo.role === User.ROLE.MODERATOR) {
      console.log(`Membership Upgrade Balance => Failed | Not free user:${username}`);
      ctx.body = {
        success: false,
        message: "You can't upgrade your membership."
      };
      return;
    }

    if (userInfo.balance < Number(expectAmount)) {
      console.log(`Membership Upgrade Balance => Failed | Insufficient balance | balance:${userInfo.balance}, username:${username}`);
      ctx.body = {
        success: false,
        message: "Insufficient balance."
      };
      return;
    }

    const { userService } = ServicesContext.getInstance();
    await userService.addBalance(userInfo.id, -expectAmount);
    await confirmMembership(userInfo, expectAmount);
    const updatedUser = await userService.findUserByUsername(username);
    updateBalanceSocket(updatedUser);
    console.log(`Membership Upgrade Balance => Success | username:${username}`);

    ctx.body = {
      success: true,
      message: "Membership Upgraded.",
      userInfo: updatedUser
    };
  } catch (error) {
    console.log(`Membership Upgrade Balance => Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

const getUsersByRole = (page = 0, count = 10, role?, name?, username?, email?, searchString?): Promise<any> => new Promise(async (resolve, reject) => {
  if (count === 0) return ([]);
  const { userService } = ServicesContext.getInstance();
  const users = await userService.getUsers({
    start: page * count, count,
    role, name, username, email, searchString
  });
  resolve(users);
});