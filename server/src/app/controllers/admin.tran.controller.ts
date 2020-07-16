import { ServicesContext } from "../context";
import { User, InnerTransaction } from "../models";
import { isOwner } from "../utils";

const COMPANY_USERID = Number(process.env.COMPANY_USERID);

export const getFinancialAnalytics = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, innerTranService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    // Get Ads & Membership Revenue
    const totalAdsRevenue: number = await innerTranService.getAmountByType(InnerTransaction.TYPE.ADS_PURCHASE_SHARE);
    const totalMemRevenue: number = await innerTranService.getAmountByType(InnerTransaction.TYPE.MEMBERSHIP_PURCHASE_SHARE);

    // Get Owners Payments
    const owners: User[] = await userService.findUsersByRole(User.ROLE.OWNER);
    const ownerAmounts: number[] = await Promise.all(owners.map(owner => {
      return innerTranService.getAmount(owner.id);
    }));
    const ownerPayments = [];
    owners.forEach((owner, i) => {
      ownerPayments.push({ ...owner, payment: ownerAmounts[i] });
    });

    // Get Moderators Payments
    const moders: User[] = await userService.findUsersByRole(User.ROLE.MODERATOR);
    const moderAmounts = await Promise.all(moders.map(moder => {
      return innerTranService.getAmountByLastWeeks(moder.id, 5);
    }));
    const moderatorPayments = [];
    moders.forEach((moder, i) => {
      moderatorPayments.push({
        ...moder,
        payment: moderAmounts[i].payment,
        weekPayments: moderAmounts[i].weekPayments,
      });
    });

    // Get Company Maintenance Amount
    const maintenanceAmount: number = await innerTranService.getAmount(COMPANY_USERID);

    ctx.body = {
      success: true,
      totalAdsRevenue,
      totalMemRevenue,
      ownerPayments,
      moderatorPayments,
      maintenanceAmount,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};