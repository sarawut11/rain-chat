import { ServicesContext, CMCContext } from "@context";
import { User, Transaction } from "@models";
import { checkUserInfo, isOwner } from "@utils";
import { confirmMembership } from "@controllers";
import { updateBalanceSocket } from "@sockets";

const MEMBERSHIP_PRICE_USD: number = Number(process.env.MEMBERSHIP_PRICE_USD);
const TRANSACTION_REQUEST_TIMEOUT: number = Number(process.env.TRANSACTION_REQUEST_TIMEOUT);

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
    const { userService } = ServicesContext.getInstance();
    const userInfo: User = await userService.findUserByUsername(username);
    const vitaePrice = _getMembershipPriceInVitae();
    ctx.body = {
      success: true,
      vitaePrice,
      usdPrice: MEMBERSHIP_PRICE_USD,
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

export const upgradeMembershipPurchase = async (ctx, next) => {
  try {
    const { username, id: userId } = ctx.state.user;
    const { expectAmount } = ctx.request.body;
    const { transactionService } = ServicesContext.getInstance();

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
      expireTime: TRANSACTION_REQUEST_TIMEOUT
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

const _getMembershipPriceInVitae = () => {
  return MEMBERSHIP_PRICE_USD / CMCContext.getInstance().vitaePriceUSD();
};