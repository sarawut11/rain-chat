import { ServicesContext } from "../context";
import * as cryptoUtils from "../utils/crypto";

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
  if (res.length > 0) {
    const refcode = cryptoUtils.encrypt(res[0].id);
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

  const sponsorid = cryptoUtils.decrypt(refcode);
  const RowDataPacket = await userService.findUserById(sponsorid);
  const res = JSON.parse(JSON.stringify(RowDataPacket));
  if (res.length > 0) {
    ctx.body = {
      success: true,
      message: "Referral Code is valid!",
    };
  }
};