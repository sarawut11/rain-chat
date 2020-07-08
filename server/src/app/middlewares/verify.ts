/**
 * @file Middleware to handle verification
 */

import * as jwt from "jsonwebtoken";
import configs from "@configs";

export const authVerify = (token): any => {
  try {
    // Decode the userId that existed in the previous payload
    const payload = jwt.verify(token, configs.token.jwt_secret, {
      ignoreExpiration: false
    });
    return payload;
  } catch (err) {
    // ctx.throw(401, err);
    console.error(err.message);
    return false;
  }
};

export const generateToken = payload => {
  return jwt.sign(payload, configs.token.jwt_secret, {
    expiresIn: configs.token.expireIn,
  });
};