/**
 * @file Middleware to handle verification
 */

import * as jwt from "jsonwebtoken";
import configs from "@configs";

export const authVerify = token => {
  try {
    // Decode the user_id that existed in the previous payload
    const payload = jwt.verify(token, configs.jwt_secret);
    return payload;
  } catch (err) {
    // ctx.throw(401, err);
    console.error(err);
    return false;
  }
};
