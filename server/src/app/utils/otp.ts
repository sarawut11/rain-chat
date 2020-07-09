import { authenticator } from "otplib";
import { ServicesContext } from "../context";
import configs from "@configs";
import { Otp } from "../models";
import * as moment from "moment";

export const generateOtp = async (userId: number, type: number): Promise<string> => {
  const { otpService } = ServicesContext.getInstance();
  const secret = authenticator.generateSecret();
  const token = authenticator.generate(secret);
  await otpService.setOtp(userId, token, type);
  return token;
};

export const verifyOtp = async (userId: number, type: number, token: string): Promise<boolean> => {
  const { otpService } = ServicesContext.getInstance();
  const otp: Otp = await otpService.getOtp(userId, type);
  if (otp === undefined)
    return false;

  const passedTime = moment().utc().unix() - otp.time;
  if (passedTime > configs.otp.timeOut)
    return false;

  return token === otp.code;
};