import * as md5 from "md5";
import * as uniqid from "uniqid";
import { ServicesContext } from "../context";
import { socketServer } from "../socket/app.socket";

export const registerController = async (ctx, next) => {
  const { userService, groupService } = ServicesContext.getInstance();

  const { name, email, username, password, sponsor } = ctx.request.body;
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
  const sponsor_result = await userService.findUserByUserId(sponsor);
  if (!sponsor_result.length) {
    ctx.body = {
      success: false,
      message: "Referral username is invalid",
    };
    return;
  }
  const result = await userService.findUserByEmailOrUsername(email, username);
  if (result.length) {
    ctx.body = {
      success: false,
      message: "Username already exists",
    };
  } else {
    try {
      // Register DB
      await userService.insertUser([name, email, username, md5(password), sponsor_result[0].id, uniqid()]);
      // Join Rain Group & Broadcast
      const userInfo = (await userService.getUserInfoByUsername(username))[0];
      const { to_group_id } = (await groupService.getRainGroupId())[0];
      console.log(userInfo, to_group_id);
      await groupService.joinGroup(userInfo.user_id, to_group_id);
      socketServer.broadcast("getGroupMsg", {
        ...userInfo,
        message: `${userInfo.name} joined a group chat`,
        to_group_id,
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
  }
};
