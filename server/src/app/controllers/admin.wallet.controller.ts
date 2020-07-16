import { ServicesContext } from "../context";
import { isOwner, rpcInterface } from "../utils";
import { Transaction } from "../models";

export const getWalletAnalytics = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const { transactionService, innerTranService } = ServicesContext.getInstance();
    const currentBalance = await rpcInterface.getBalance();
    const totalRainDonation = await transactionService.getTotalAmountByType(Transaction.TYPE.VITAE_RAIN);
    const totalRained = await innerTranService.getTotalRainedAmount();
    const totalWithdrawn = await transactionService.getTotalAmountByType(Transaction.TYPE.WITHDRAW);

    ctx.body = {
      success: true,
      currentBalance,
      totalRainDonation,
      totalRained,
      totalWithdrawn,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};