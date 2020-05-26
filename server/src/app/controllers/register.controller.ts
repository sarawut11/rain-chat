import * as md5 from "md5";
import * as cryptoUtils from "../utils/crypto";
import { ServicesContext } from "../context";

export const registerController = async (ctx, next) => {
  const { userService } = ServicesContext.getInstance();

  const { name, email, username, password, refcode } = ctx.request.body;
  if (username === "" || password === "" || name === "" || email === "") {
    ctx.body = {
      success: false,
      message: "Username or password cannot be empty",
    };
    return;
  }
  if (refcode === "" || !refcode) {
    ctx.body = {
      success: false,
      message: "Please provide the referral code",
    };
    return;
  }
  // Check Referral Username
  const sponsorid = cryptoUtils.decrypt(refcode);
  const sponsor_result = await userService.findUserById(sponsorid);
  if (!sponsor_result.length) {
    ctx.body = {
      success: false,
      message: "Referral username is invalid",
    };
    return;
  }
  const result = await userService.findUserByEmailOrUsername(email, username);
  if (result.length) {
    ctx.body = {
      success: false,
      message: "Username already exists",
    };
  } else {
    ctx.body = {
      success: true,
      message: "Registration success!",
    };
    console.log("Registration success");
    userService.insertUser([name, email, username, md5(password), sponsorid]);
  }
};
