import * as md5 from "md5";
import * as uniqid from "uniqid";
import { generateToken, authVerify } from "../middlewares/verify";
import { ServicesContext } from "../context";
import { socketServer } from "../socket/app.socket";
import configs from "@configs";
import { User } from "../models";
import { isVitaePostEnabled } from "../utils/utils";

export const loginUser = async (ctx, next) => {
  const { userService } = ServicesContext.getInstance();

  const { email = "", username = "", password = "" } = ctx.request.body;
  if ((username === "" && email === "") || password === "") {
    ctx.body = {
      success: false,
      message: "Username or password cannot be empty",
    };
    return;
  }
  const users: User[] = await userService.findUserByEmailOrUsername(email, username);
  if (users.length > 0) {
    //   After the verification is successful, the server will issue a Token, and then send the Token to the client
    if (md5(password) === users[0].password) {
      const { id, name, email, balance, username, intro, avatar, socketid, refcode, role } = users[0];
      const token = generateToken({ id, username });
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
          socketid,
          referral: refcode,
          role,
          token,
          isVitaePostEnabled: isVitaePostEnabled(users[0])
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

export const registerUser = async (ctx, next) => {
  try {
    const { name, email, username, password, sponsor } = ctx.request.body;
    const { userService, groupService } = ServicesContext.getInstance();

    if (username === "" || password === "" || name === "" || email === "") {
      ctx.body = {
        success: false,
        message: "Username or password cannot be empty",
      };
      return;
    }
    if (sponsor === "" || !sponsor) {
      ctx.body = {
        success: false,
        message: "Please provide the referral code",
      };
      return;
    }
    // Check Referral Username
    const sponsorUser: User[] = await userService.findUserByRefcode(sponsor);
    if (sponsorUser.length === 0) {
      ctx.body = {
        success: false,
        message: "Referral username is invalid",
      };
      return;
    }
    const existingUser: User[] = await userService.findUserByEmailOrUsername(email, username);
    if (existingUser.length) {
      ctx.body = {
        success: false,
        message: "Username or email already exists",
      };
      return;
    }
    // Register DB
    await userService.insertUser([name, email, username, md5(password), sponsorUser[0].id, uniqid()]);
    // Join Rain Group & Broadcast
    const userInfo = (await userService.getUserInfoByUsername(username))[0];
    await groupService.joinGroup(userInfo.user_id, configs.rain.group_id);
    socketServer.broadcast("getGroupMsg", {
      ...userInfo,
      message: `${userInfo.name} joined a group chat`,
      to_group_id: configs.rain.group_id,
      tip: "joinGroup",
    }, error => console.log(error.message));

    ctx.body = {
      success: true,
      message: "Registration success!",
    };
    console.log("Registration success");
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Registration failed!",
    };
  }
};

export const validateToken = async (ctx, next) => {
  try {
    const { token } = ctx.request.body;

    const checkResult = authVerify(token);
    if (checkResult === false) {
      ctx.body = {
        success: false,
        message: "Invalid Token"
      };
      return;
    }

    const { username, id } = checkResult;
    const { userService } = ServicesContext.getInstance();
    const RowDataPacket = await userService.getUserInfoByUsername(username);
    if (RowDataPacket.length <= 0) {
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }
    const userInfo = RowDataPacket[0];
    ctx.body = {
      success: true,
      message: "Valid",
      userInfo,
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Invalid Username.",
    };
  }
};