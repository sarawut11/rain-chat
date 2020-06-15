/**
 * @file Middleware to handle verification
 */

import * as jwt from "jsonwebtoken";
import * as koaJwt from "koa-jwt";
import configs from "@configs";

export const authVerify = (token): any => {
  try {
    // Decode the user_id that existed in the previous payload
    const payload = jwt.verify(token, configs.token.jwt_secret, {
      ignoreExpiration: false
    });
    return payload;
  } catch (err) {
    // ctx.throw(401, err);
    console.error(err);
    return false;
  }
};

export const generateToken = payload => {
  return jwt.sign(payload, configs.token.jwt_secret, {
    expiresIn: configs.token.expireIn,
  });
};