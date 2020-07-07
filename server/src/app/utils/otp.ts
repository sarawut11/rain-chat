import { authenticator } from "otplib";
import configs from "@configs";

const secret = authenticator.generateSecret();
authenticator.options = {
  step: configs.otp.timeOut
};

export const generateOtp = (): string => {
  const token = authenticator.generate(secret);
  return token;
};

export const verifyOtp = (token: string): boolean => {
  const isValid = authenticator.verify({ token, secret });
  return isValid;
};