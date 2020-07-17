import { ServicesContext, RainContext } from "../context";
import { User } from "../models";

const COMPANY_RAIN_ADDRESS = process.env.COMPANY_RAIN_ADDRESS;

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
      rainAddress: COMPANY_RAIN_ADDRESS
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