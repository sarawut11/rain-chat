import * as md5 from "md5";
import * as uniqid from "uniqid";
import * as moment from "moment";
import { generateToken, authVerify } from "../middlewares/verify";
import { ServicesContext } from "../context";
import { socketServer } from "../socket/app.socket";
import configs from "@configs";
import { User, Ban } from "../models";
import { isVitaePostEnabled } from "../utils/utils";

export const loginUser = async (ctx, next) => {
  try {
    const { userService, banService } = ServicesContext.getInstance();

    const { email = "", username = "", password = "" } = ctx.request.body;
    if ((username === "" && email === "") || password === "") {
      ctx.body = {
        success: false,
        message: "Username or password cannot be empty",
      };
      return;
    }
    const users: User[] = await userService.findUserByEmailOrUsername(email, username);
    if (users.length === 0) {
      ctx.body = {
        success: false,
        message: "Invalid username or email",
      };
      return;
    }
    //   After the verification is successful, the server will issue a Token, and then send the Token to the client
    if (md5(password) !== users[0].password) {
      ctx.body = {
        success: false,
        message: "Wrong Password",
      };
      return;
    }
    const { id, username: userName, email: userEmail, name, balance, intro, avatar, refcode, role, ban } = users[0];
    const bans: Ban[] = await banService.getBanInfo(id, configs.rain.group_id, Ban.TYPE.GROUP);
    if (bans.length >= 3) {
      ctx.body = {
        success: false,
        message: "You are permanentaly banned."
      };
      return;
    }
    if (ban === User.BAN.BANNED) {
      const lastBanTime = bans[0].time;
      const paneltyDays = bans.length === 1 ? 1 : 3;
      if (lastBanTime <= moment().utc().subtract(paneltyDays, "day").unix()) {
        await userService.unbanUsersFromRainGroup([id]);
      }
    }
    const token = generateToken({ id, username });
    ctx.body = {
      success: true,
      message: "Login Successful",
      userInfo: {
        name,
        email: userEmail,
        username: userName,
        userId: id,
        balance,
        intro,
        avatar,
        referral: refcode,
        role,
        token,
        ban,
        isVitaePostEnabled: isVitaePostEnabled(users[0])
      },
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Login Failed!",
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
    await groupService.joinGroup(userInfo.userId, configs.rain.group_id);
    socketServer.broadcast("getGroupMsg", {
      ...userInfo,
      message: `${userInfo.name} joined a group chat`,
      groupId: configs.rain.group_id,
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