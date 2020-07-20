import { ServicesContext } from "@context";
import { User } from "@models";

export const validateReferral = async (ctx, next) => {
  const { refcode } = ctx.request.body;
  const { userService } = ServicesContext.getInstance();

  const userInfo: User = await userService.findUserByRefcode(refcode);
  if (userInfo === undefined) {
    console.log("Referral => Validation Failed | Invalid referral code.");
    ctx.body = {
      success: false,
      message: "Referral code is invalid!",
    };
  } else {
    console.log("Referral => Validation Success | Sponsor:", userInfo.username);
    ctx.body = {
      success: true,
      message: "Referral code is valid!",
    };
  }
};