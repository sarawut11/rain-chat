import { ServicesContext, CMCContext, RainContext } from "../context";
import configs from "@configs";
import * as moment from "moment";
import { User, InnerTransaction } from "../models";
import { Transaction } from "../models/transaction.model";
import { checkUserInfo, isOwner } from "../utils/utils";

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
    const vitaePrice = _getMembershipPrice();
    ctx.body = {
      success: true,
      vitaePrice,
      usdPrice: configs.membership.price,
      walletAddress: "testing wallet address"
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const upgradeMembership = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { expectAmount } = ctx.request.body;
    const { transactionService } = ServicesContext.getInstance();

    const checkUser = await checkUserInfo(username);
    if (checkUser.success === false) {
      ctx.body = checkUser;
      return;
    }
    const { userInfo } = checkUser;
    if (userInfo.role === User.ROLE.OWNER || userInfo.role === User.ROLE.MODERATOR) {
      ctx.body = {
        success: false,
        message: "You can't upgrade your membership."
      };
    }

    await transactionService.createTransactionRequest(userInfo.userId, Transaction.TYPE.MEMBERSHIP, expectAmount);

    ctx.body = {
      success: true,
      message: "Your membership request is in pending.",
      expireTime: configs.transactionTimeout
    };
  } catch (error) {
    console.log(error.message);
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

const _getMembershipPrice = () => {
  return configs.membership.price / CMCContext.getInstance().vitaePriceUSD();
};