import { authenticator } from "otplib";
import { ServicesContext } from "../context";
import { Otp } from "../models";
import { now } from "./utils";

const OTP_TIMEOUT = Number(process.env.OTP_TIMEOUT);

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

  const passedTime = now() - otp.time;
  if (passedTime > OTP_TIMEOUT / 1000)
    return false;

  return token === otp.code;
};