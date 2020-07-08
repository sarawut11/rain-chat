import { ServicesContext } from "../context";
import * as uniqid from "uniqid";
import { User } from "../models";

export const generateReferral = async (ctx, next) => {
  const { sponsor } = ctx.request.body;
  const { userService } = ServicesContext.getInstance();

  if (sponsor === "") {
    ctx.body = {
      success: false,
      message: "Sponsor username cannot be empty",
    };
    return;
  }

  const userInfo: User = await userService.findUserByUsername(sponsor);
  if (userInfo === undefined) {
    ctx.body = {
      success: false,
      message: "Invalid sponsor."
    };
    return;
  }
  let refcode = userInfo.refcode;
  if (refcode === "" || !refcode) {
    refcode = uniqid();
    await userService.setRefcode(sponsor, refcode);
  }
  ctx.body = {
    success: true,
    message: "Referral Code Generated!",
    refcode
  };
};

export const validateReferral = async (ctx, next) => {
  const { refcode } = ctx.request.body;
  const { userService } = ServicesContext.getInstance();

  const userInfo: User = await userService.findUserByRefcode(refcode);
  if (userInfo === undefined) {
    ctx.body = {
      success: false,
      message: "Referral code is invalid!",
    };
  } else {
    ctx.body = {
      success: true,
      message: "Referral code is valid!",
    };
  }
};