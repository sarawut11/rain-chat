import { ServicesContext } from "../context";
import { User } from "../models";
import { Transaction } from "../models/transaction.model";

export const getHomeAnalytics = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, transactionService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    // Get Transaction Analytics
    let totalAdPurchases = 0;
    const allTrans: Transaction[] = await transactionService.getTransactions();
    allTrans.forEach(tran => {
      if (tran.type === Transaction.TYPE.ADS)
        totalAdPurchases += tran.paidAmount;
    });

    // Get User Analytics
    let totalMembersCount = 0;
    let freeMembersCount = 0;
    let upgradedMembersCount = 0;
    let moderatorsCount = 0;
    let onlineModeratorsCount = 0;
    const allUsers: User[] = await userService.fuzzyMatchUsers("%%");
    allUsers.forEach(user => {
      if (user.role === User.ROLE.FREE) freeMembersCount++;
      if (user.role === User.ROLE.UPGRADED_USER) upgradedMembersCount++;
      if (user.role === User.ROLE.MODERATOR) moderatorsCount++;
      if (user.role === User.ROLE.MODERATOR && user.socketid !== "") onlineModeratorsCount++;
    });
    totalMembersCount = allUsers.length;

    ctx.body = {
      success: true,
      totalAdPurchases,
      totalMembersCount,
      freeMembersCount,
      upgradedMembersCount,
      moderatorsCount,
      onlineModeratorsCount,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

const isOwner = (username): Promise<any> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const RowDataPacket: User[] = await userService.getUserInfoByUsername(username);
  if (RowDataPacket.length <= 0) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
  const userInfo = RowDataPacket[0];
  if (userInfo.role !== User.ROLE.OWNER) {
    resolve({
      success: false,
      message: "You are not a Owner."
    });
    return;
  }
  resolve({
    success: true,
    userInfo,
  });
});