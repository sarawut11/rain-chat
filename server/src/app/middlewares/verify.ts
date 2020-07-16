/**
 * @file Middleware to handle verification
 */

import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = Number(process.env.JWT_EXPIRE) / 1000;

export const authVerify = (token): any => {
  try {
    // Decode the userId that existed in the previous payload
    const payload = jwt.verify(token, JWT_SECRET, {
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
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};