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

    const { role, name, email, username: searchUsername, searchString, page, count } = ctx.request.query;
    const users = await getUsersByRole(page, count, role, name, searchUsername, email, searchString);
    const totalCount = users.length === 0 ? 0 : users[0].totalCount;
    ctx.body = {
      success: true,
      totalCount,
      users
    };
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

export const upgradeMembership = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, membershipService } = ServicesContext.getInstance();

    const checkUser = await checkUserInfo(username);
    if (checkUser.success === false) {
      ctx.body = checkUser;
      return;
    }
    const { userInfo } = checkUser;
    if (userInfo.role === UserService.Role.OWNER || userInfo.role === UserService.Role.MODERATOR) {
      ctx.body = {
        success: false,
        message: "You can't upgrade your membership."
      };
    }

    await membershipService.insertMembershipInfo(userInfo.user_id);
    ctx.body = {
      success: true,
      message: "Your membership request is in pending."
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const confirmMembership = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, membershipService } = ServicesContext.getInstance();

    const checkUser = await checkUserInfo(username);
    if (checkUser.success === false) {
      ctx.body = checkUser;
      return;
    }
    const { userInfo } = checkUser;
    if (userInfo.role !== UserService.Role.MODERATOR) {
      ctx.body = {
        success: false,
        message: "Invalid Role"
      };
      return;
    }


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
  if (userInfo.user_id === 1) { // Default Admin
    resolve({
      success: false,
      message: "Can't modify this user's info"
    });
  }
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

const getUsersByRole = (page = 0, count = 10, role?, name?, username?, email?, searchString?): Promise<any> => new Promise(async (resolve, reject) => {
  if (count === 0) return ([]);
  const { userService } = ServicesContext.getInstance();
  const users = await userService.getUsers({
    start: page * count, count,
    role, name, username, email, searchString
  });
  resolve(users);
});