import { ServicesContext } from "../context";
import * as uniqid from "uniqid";

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

  const RowDataPacket = await userService.findUserByUsername(sponsor);
  const res = JSON.parse(JSON.stringify(RowDataPacket));
  let refcode = res[0].userid;
  if (refcode === "" || !refcode) {
    refcode = uniqid();
    await userService.setUserId(sponsor, refcode);
  }
  if (res.length > 0) {
    ctx.body = {
      success: true,
      message: "Referral Code Generated!",
      refcode
    };
  }
};

export const validateReferral = async (ctx, next) => {
  const { refcode } = ctx.request.body;
  const { userService } = ServicesContext.getInstance();

  const RowDataPacket = await userService.findUserByUserId(refcode);
  const res = JSON.parse(JSON.stringify(RowDataPacket));
  if (res.length > 0) {
    ctx.body = {
      success: true,
      message: "Referral code is valid!",
    };
  } else {
    ctx.body = {
      success: false,
      message: "Referral code is invalid!",
    };
  }
};