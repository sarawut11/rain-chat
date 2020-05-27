/**
 * @file Middleware to handle verification
 */

import * as jwt from "jsonwebtoken";

export const authVerify = token => {
  try {
    // Decode the user_id that existed in the previous payload
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (err) {
    // ctx.throw(401, err);
    console.error(err);
    return false;
  }
};

export const generateToken = payload => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 7, // One Week
  });
};