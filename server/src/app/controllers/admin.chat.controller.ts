import { ServicesContext } from "../context";
import { User } from "../models";
import { isOwner } from "../utils/utils";

export const getChatAnalytics = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, groupService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const users: User[] = await userService.fuzzyMatchUsers("%%");
    const userCount = users.length;
    const onlineUserCount = users.filter(user => user.socketid !== "").length;
    const groups = await groupService.fuzzyMatchGroups("%%");
    const groupCount = groups.length;

    ctx.body = {
      success: true,
      userCount,
      onlineUserCount,
      groupCount,
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};