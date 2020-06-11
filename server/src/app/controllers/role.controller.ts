import { ServicesContext } from "../context";
import { UserService } from "../services";

export const getAllUsers = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const { role, start, count } = ctx.request.query;
    if (role === undefined) { // Get All Users
      const owners = await getUsersByRole(UserService.Role.OWNER);
      const moderators = await getUsersByRole(UserService.Role.MODERATOR);
      const members = await getUsersByRole(UserService.Role.UPGRADED_USER);
      const freeUsers = await getUsersByRole(UserService.Role.FREE);
      ctx.body = {
        success: true,
        owners,
        moderators,
        members,
        freeUsers
      };
    } else {
      const users = await getUsersByRole(role, start, count);
      ctx.body = {
        success: true,
        users
      };
    }
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const setUserRole = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { username: assigneeUsername, role } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }
    const checkUser = await checkUserInfo(assigneeUsername, role);
    if (checkUser.success === false) {
      ctx.body = checkUser;
      return;
    }
    await userService.updateRole(assigneeUsername, role);
    const user = await userService.findUserByUsername(username);
    ctx.body = {
      success: true,
      message: "Successfully Updated",
      userInfo: user[0],
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

const isOwner = (username): Promise<any> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const RowDataPacket = await userService.getUserInfoByUsername(username);
  if (RowDataPacket.length <= 0) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
  const userInfo = RowDataPacket[0];
  if (userInfo.role !== UserService.Role.OWNER) {
    resolve({
      success: false,
      message: "You are not a Owner."
    });
    return;
  }
  resolve({
    success: true,
    userInfo,
  });
});

const checkUserInfo = (username, role?): Promise<any> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const RowDataPacket = await userService.getUserInfoByUsername(username);
  if (RowDataPacket.length <= 0) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
  const userInfo = RowDataPacket[0];
  if (role === undefined) {
    resolve({
      success: true,
      userInfo,
    });
  }
  if (role === UserService.Role.FREE ||
    role === UserService.Role.MODERATOR ||
    role === UserService.Role.OWNER ||
    role === UserService.Role.UPGRADED_USER) {
    resolve({
      success: true,
      userInfo,
    });
  } else {
    resolve({
      success: false,
      message: "Invalid Role."
    });
  }
});

const getUsersByRole = (role = UserService.Role.FREE, start = 1, count = 10): Promise<any> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const users = await userService.getUsersByRole(role, start - 1, count);
  resolve(users);
});