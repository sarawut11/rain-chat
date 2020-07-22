import { ServicesContext, RainContext } from "@context";
import { User } from "@models";
import { updateBalanceSocket } from "@sockets";

const COMPANY_RAIN_ADDRESS = process.env.COMPANY_RAIN_ADDRESS;

export const getCompanyRainAddress = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService } = ServicesContext.getInstance();

    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      console.log(`Company Rain Address => Failed | Invalid username:${username}`);
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
    console.log(`Company Rain Address => Failed | Error:${error.message}`);
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
      console.log(`Rain From Balance => Failed | Invalid username:${username}`);
      ctx.body = {
        success: false,
        message: "Invalid username"
      };
      return;
    }

    const balance = userInfo.balance;
    if (amount > balance || amount < 0) {
      console.log(`Rain From Balance => Failed | Insufficient balance:${balance}, amount:${amount}, username:${username}`);
      ctx.body = {
        success: false,
        message: "Invalid amount"
      };
      return;
    }

    // Update Balance
    await userService.addBalance(userInfo.id, -amount);
    const updatedUser: User = await userService.findUserById(userInfo.id);
    updateBalanceSocket(updatedUser);

    // Rain last users
    RainContext.getInstance().rainUsersByLastActivity(amount);
    console.log(`Rain From Balance => Success | Rained:${amount}, Username:${username}`);

    ctx.body = {
      success: true,
      message: "Success",
      userInfo: updatedUser
    };
  } catch (error) {
    console.log(`Rain From Balance => Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};