import { ServicesContext } from "@context";
import { isOwner, rpcInterface } from "@utils";
import { Transaction } from "@models";

const COMPANY_STOCKPILE_USERID = Number(process.env.COMPANY_STOCKPILE_USERID);

export const getWalletAnalytics = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const { userService, transactionService, innerTranService } = ServicesContext.getInstance();
    const currentBalance = await rpcInterface.getBalance();
    const totalRainDonation = await transactionService.getTotalAmountByType(Transaction.TYPE.VITAE_RAIN);
    const totalRained = await innerTranService.getTotalRainedAmount();
    const totalWithdrawn = await transactionService.getTotalAmountByType(Transaction.TYPE.WITHDRAW);
    const stockpile = await userService.findUserById(COMPANY_STOCKPILE_USERID);

    ctx.body = {
      success: true,
      currentBalance,
      totalRainDonation,
      totalRained,
      totalWithdrawn,
      stockpileAddress: stockpile.walletAddress,
      stockpileBalance: stockpile.balance,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};