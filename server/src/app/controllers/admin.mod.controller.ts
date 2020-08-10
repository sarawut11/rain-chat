import * as moment from "moment";
import { ServicesContext } from "@context";
import { User } from "@models";
import { isOwner, checkUserInfo } from "@utils";

export const getModsAnalytics = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const moders: User[] = await userService.findUsersByRole(User.ROLE.MODERATOR);
    const modersCount = moders.length;
    const onlineModersCount = moders.filter(moder => moder.socketid !== "").length;

    ctx.body = {
      success: true,
      modersCount,
      onlineModersCount,
      moders,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const getUsernamelist = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const users: User[] = await userService.getUsernamelist();
    ctx.body = {
      success: true,
      usernameList: users
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const updateModers = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { usernamelist } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    await userService.setModers(usernamelist);
    const users: User[] = await userService.getUsersByUsernames(usernamelist);
    ctx.body = {
      success: true,
      users,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const cancelModer = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { username: modUsername } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const userInfo = checkRole.userInfo;
    const expireTime = moment().utc().subtract(1, "months").unix();
    if (userInfo.lastUpgradeTime <= expireTime) {
      await userService.updateRole(modUsername, User.ROLE.FREE);
    } else {
      await userService.updateRole(modUsername, User.ROLE.UPGRADED_USER);
    }
    const updatedUser: User = await userService.findUserByUsername(modUsername);
    ctx.body = {
      success: true,
      userInfo: updatedUser
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const setModerator = async (ctx, next) => {
  try {
    const { username, id: userId } = ctx.state.user;
    const { username: assigneeUsername } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }
    const checkUser = await checkUserInfo(assigneeUsername);
    if (checkUser.success === false) {
      ctx.body = checkUser;
      return;
    }
    await userService.updateMembership(userId, User.ROLE.MODERATOR);
    const updatedUser: User = await userService.findUserByUsername(username);
    ctx.body = {
      success: true,
      message: "Successfully Updated",
      userInfo: updatedUser,
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

