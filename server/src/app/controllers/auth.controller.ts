import * as md5 from "md5";
import * as uniqid from "uniqid";
import * as moment from "moment";
import { generateToken, authVerify } from "@middlewares";
import { socketServer } from "@sockets";
import { ServicesContext } from "@context";
import { User, Ban, Otp, Setting } from "@models";
import { isVitaePostEnabled, generateOtp, verifyOtp, sendMail, rpcInterface, hashCode, vitaeToUsd } from "@utils";

const RAIN_GROUP_ID = process.env.RAIN_GROUP_ID;

export const loginUser = async (ctx, next) => {
  try {
    const { userService, banService } = ServicesContext.getInstance();

    const { email = "", username = "", password = "" } = ctx.request.body;
    if ((username === "" && email === "") || password === "") {
      console.log("Login => Failed | Username or password cannot be empty.");
      ctx.body = {
        success: false,
        message: "Username or password cannot be empty",
      };
      return;
    }
    const user: User = await userService.findUserByEmailOrUsername(email, username);
    if (user === undefined) {
      console.log("Login => Failed | Username does not exist. | Username:", username);
      ctx.body = {
        success: false,
        message: "Invalid username or email",
      };
      return;
    }
    //   After the verification is successful, the server will issue a Token, and then send the Token to the client
    if (md5(password) !== user.password) {
      console.log("Login => Failed | Wrong password. | Username:", username);
      ctx.body = {
        success: false,
        message: "Wrong Password",
      };
      return;
    }
    const { id, username: userName, email: userEmail, name, balance, intro, avatar, refcode, role, ban } = user;
    const bans: Ban[] = await banService.getBanInfo(id, RAIN_GROUP_ID, Ban.TYPE.GROUP);
    if (bans.length >= 3) {
      console.log("Login => Failed | Permanently banned. | Username:", username);
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
        console.log("Login => Check banned time. Unbanned. | Username:", username);
      }
    }
    const token = generateToken({ id, username });
    const vitaePostEnabled = await isVitaePostEnabled(user);
    const myRefs = await userService.getMyRefs(user.id);
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
        refcode,
        role,
        token,
        ban,
        myRefs,
        isVitaePostEnabled: vitaePostEnabled
      },
    };
    console.log("Login => Success | Username:", username);
  } catch (error) {
    console.log("Login => Failed | Error:", error.message);
    ctx.body = {
      success: false,
      message: "Login Failed!",
    };
  }
};

export const registerUser = async (ctx, next) => {
  try {
    const { name, email, username, password, sponsor, otp } = ctx.request.body;
    const { userService, groupService } = ServicesContext.getInstance();

    if (username === "" || password === "" || name === "" || email === "") {
      console.log("Register => Failed | Username or password cannot be empty.");
      ctx.body = {
        success: false,
        message: "Username or password cannot be empty",
      };
      return;
    }
    if (sponsor === "" || !sponsor) {
      console.log("Register => Failed | Sponsor field is empty.");
      ctx.body = {
        success: false,
        message: "Please provide the referral code",
      };
      return;
    }
    // Check Referral Username
    const sponsorUser: User = await userService.findUserByRefcode(sponsor);
    if (sponsorUser === undefined) {
      console.log("Register => Failed | Sponsor user is invalid. | Sponsor:", sponsor);
      ctx.body = {
        success: false,
        message: "Referral username is invalid",
      };
      return;
    }
    // Verify OTP
    const isValid: boolean = await verifyOtp(hashCode(email), Otp.TYPE.SIGNUP, otp);
    if (!isValid) {
      console.log("Register => Failed | Invalid Code. | code:", otp);
      ctx.body = {
        success: false,
        message: "Invalid OTP Code",
      };
      return;
    }
    // Check existing user
    const existingUser: User = await userService.findUserByEmailOrUsername(email, username);
    if (existingUser !== undefined) {
      console.log("Register => Failed | Same username or email already exists. | Username:", username);
      ctx.body = {
        success: false,
        message: "Username or email already exists",
      };
      return;
    }

    // Register DB
    const walletAddress = await rpcInterface.getNewAddress();
    await userService.insertUser({
      name, email, username,
      password: md5(password),
      sponsorId: sponsorUser.id,
      refcode: uniqid(),
      walletAddress
    });
    // Join Rain Group & Broadcast
    const userInfo: User = await userService.getUserInfoByUsername(username);
    await groupService.joinGroup(userInfo.id, RAIN_GROUP_ID);
    socketServer.broadcast("getGroupMsg", {
      ...userInfo,
      message: `${userInfo.name} joined a group chat`,
      groupId: RAIN_GROUP_ID,
      tip: "joinGroup",
    }, error => console.log(error.message));

    ctx.body = {
      success: true,
      message: "Registration success!",
    };
    console.log("Register => Success | Username:", username);
  } catch (error) {
    console.log("Register => Failed | Error:", error.message);
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
      console.log("Token Validation => Failed | Invalid Token");
      ctx.body = {
        success: false,
        message: "Invalid Token"
      };
      return;
    }

    const { username } = checkResult;
    const { userService } = ServicesContext.getInstance();
    const userInfo = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      console.log("Token Validation => Failed | Username does not exist. | Username:", username);
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }
    ctx.body = {
      success: true,
      message: "Valid",
      userInfo,
    };
    console.log("Token Validation => Success | Username:", username);
  } catch (error) {
    console.log("Token Validation => Failed | Error:", error.message);
    ctx.body = {
      success: false,
      message: "Invalid Username.",
    };
  }
};

export const generateOTP = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, settingService } = ServicesContext.getInstance();

    const user: User = await userService.findUserByUsername(username);
    if (user === undefined) {
      console.log("OTP | Withdraw => Failed | Invalid Username:", username);
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }

    const otp: string = await generateOtp(user.id, Otp.TYPE.WITHDRAW);
    const otpExpire: number = await settingService.getSettingValue(Setting.KEY.OTP_EXPIRE);

    sendMail("otp/withdraw.html", {
      email: user.email,
      subject: "Email Withdrawal",
      data: {
        username,
        code: otp,
        expire: otpExpire
      }
    });
    console.log("OTP | Withdraw => Success | 6 Digit Code Generated, Sending Email...");
    ctx.body = {
      success: true,
      message: "6 digit code sent to your email.",
      expireIn: otpExpire
    };
  } catch (error) {
    console.log("OTP | Withdraw => Failed | Error:", error.message);
    ctx.body = {
      success: false,
      message: "Invalid Username.",
    };
  }
};

export const verifyOTP = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { token } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const user: User = await userService.findUserByUsername(username);
    if (user === undefined) {
      console.log("OTP | Verify => Failed | Invalid Username:", username);
      ctx.body = {
        success: false,
        message: "Invalid Username."
      };
      return;
    }

    const isValid: boolean = await verifyOtp(user.id, Otp.TYPE.WITHDRAW, token);
    ctx.body = {
      success: true,
      message: isValid ? "Verified" : "Token invalid or expired",
      isValid,
    };
    console.log("OTP | Verify => Success | Username:", username);
  } catch (error) {
    console.log("OTP | Verify => Failed | Error:", error.message);
    ctx.body = {
      success: false,
      message: "Invalid Username.",
    };
  }
};

export const generateEmailOtp = async (ctx, next) => {
  try {
    const { email } = ctx.request.body;
    const { userService, settingService } = ServicesContext.getInstance();

    const user: User = await userService.findUserByEmail(email);
    if (user !== undefined) {
      console.log("OTP | Signup => Failed | Same email exist | email:", email);
      ctx.body = {
        success: false,
        message: "Email already exists."
      };
      return;
    }

    const userId = hashCode(email);
    const otp: string = await generateOtp(userId, Otp.TYPE.SIGNUP);
    const otpExpire: number = await settingService.getSettingValue(Setting.KEY.OTP_EXPIRE);
    sendMail("otp/signup.html", {
      email,
      subject: "Email Confirmation",
      data: {
        code: otp,
        expire: otpExpire
      }
    });
    console.log("OTP | Signup => Success | 6 Digit Code Generated, Sending Email...");
    ctx.body = {
      success: true,
      message: "6 digit code sent to your email.",
      expireIn: otpExpire
    };
  } catch (error) {
    console.log("OTP | Signup => Failed | Error:", error.message);
    ctx.body = {
      success: false,
      message: "Invalid Username.",
    };
  }
};

export const getTotalRained = async (ctx, next) => {
  try {
    const { innerTranService } = ServicesContext.getInstance();
    const totalRainedVitae = await innerTranService.getTotalRainedAmount();
    const totalRainedUsd = vitaeToUsd(totalRainedVitae);
    ctx.body = {
      success: true,
      totalRainedUsd,
      totalRainedVitae,
    };
  } catch (error) {
    console.log("Total Rain => Failed | Error:", error.message);
    ctx.body = {
      success: false,
      message: "Failed. Something went wrong.",
    };
  }
};