import { ServicesContext, RainContext } from "../context";
import { User, Transaction } from "../models";
import * as moment from "moment";

export const sendVitaeBalance = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService } = ServicesContext.getInstance();
    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      ctx.body = {
        success: false,
        message: "Invalid username"
      };
      return;
    }

    const amount = userInfo.balance;
    await userService.resetBalance(userInfo.id);
    await RainContext.getInstance().rainUsersByLastActivity(amount);
    const updatedUser: User = await userService.findUserById(userInfo.id);

    ctx.body = {
      success: true,
      message: "Success",
      userInfo: updatedUser
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const sendVitaePurchase = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { companyRainAddress, amount } = ctx.request.body;
    const { userService, transactionService } = ServicesContext.getInstance();
    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      ctx.body = {
        success: false,
        message: "Invalid username"
      };
      return;
    }

    const tranDetails = JSON.stringify({
      toAddress: companyRainAddress,
      amount,
      time: moment().utc().unix()
    });
    await transactionService.createTransactionRequest(userInfo.id, Transaction.TYPE.VITAE_RAIN, amount, tranDetails);
    ctx.body = {
      success: true,
      message: "Success"
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};