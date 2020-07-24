import { authenticator } from "otplib";
import { ServicesContext } from "@context";
import { Otp, Setting } from "@models";
import { now } from "@utils";

export const generateOtp = async (userId: number, type: number): Promise<string> => {
  const { otpService } = ServicesContext.getInstance();
  const secret = authenticator.generateSecret();
  const token = authenticator.generate(secret);
  await otpService.setOtp(userId, token, type);
  return token;
};

export const verifyOtp = async (userId: number, type: number, token: string): Promise<boolean> => {
  const { otpService, settingService } = ServicesContext.getInstance();
  const otp: Otp = await otpService.getOtp(userId, type);
  if (otp === undefined)
    return false;

  const otpExpire: number = await settingService.getSettingValue(Setting.KEY.OTP_EXPIRE);
  const passedTime = now() - otp.time;
  if (passedTime > otpExpire / 1000)
    return false;

  return token === otp.code;
};

export const hashCode = (str: string) => {
  // tslint:disable-next-line: one-variable-per-declaration
  let hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i);
    // tslint:disable-next-line: no-bitwise
    hash = ((hash << 5) - hash) + chr;
    // tslint:disable-next-line: no-bitwise
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};