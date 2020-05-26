import * as jwt from "jsonwebtoken";
import * as md5 from "md5";
import configs from "@configs";
import { ServicesContext } from "../context";

// The username login system only involves non-github users, that is, github users can only log in with github authorization
export const loginController = async (ctx, next) => {
  const { userService } = ServicesContext.getInstance();

  const { email = "", username = "", password = "" } = ctx.request.body;
  if ((username === "" && email === "") || password === "") {
    ctx.body = {
      success: false,
      message: "Username or password cannot be empty",
    };
    return;
  }
  const RowDataPacket = await userService.findUserByEmailOrUsername(email, username);
  const res = JSON.parse(JSON.stringify(RowDataPacket));
  if (res.length > 0) {
    //   After the verification is successful, the server will issue a Token, and then send the Token to the client
    if (md5(password) === res[0].password) {
      const { id, name, email, balance, username, intro, avatar, socketId } = res[0];
      const payload = { id };
      const token = jwt.sign(payload, configs.jwt_secret, {
        expiresIn: Math.floor(Date.now() / 1000) + 24 * 60 * 60 * 7, // One Week
      });
      ctx.body = {
        success: true,
        message: "Login Successful",
        userInfo: {
          name,
          email,
          username,
          user_id: id,
          balance,
          intro,
          avatar,
          socketId,
          token,
        },
      };
    } else {
      ctx.body = {
        success: false,
        message: "Wrong Password",
      };
    }
  } else {
    ctx.body = {
      success: false,
      message: "Username Error",
    };
  }
};