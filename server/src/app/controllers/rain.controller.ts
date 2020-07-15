import { ServicesContext, RainContext } from "../context";
import { Transaction, User, TransactionDetail } from "../models";
import configs from "@configs";
import * as moment from "moment";

export const getCompanyRainAddress = async (ctx, next) => {
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

    ctx.body = {
      success: true,
      rainAddress: configs.companyRainAddress
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};

export const rainFromBalance = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { amount } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();
    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      ctx.body = {
        success: false,
        message: "Invalid username"
      };
      return;
    }

    const balance = userInfo.balance;
    if (amount > balance || amount < 0) {
      ctx.body = {
        success: false,
        message: "Invalid amount"
      };
      return;
    }

    await userService.addBalance(userInfo.id, -amount);
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