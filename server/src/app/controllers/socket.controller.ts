import { ServicesContext } from "@context";
import { socketServer, getAllMessage, getGroupItem } from "@sockets";
import { User } from "@models";

export const initSocket = async (ctx, next) => {
  try {
    const { id: userId, username } = ctx.state.user;
    const { clientHomePageList } = ctx.request.body;
    const allMessage = await getAllMessage({ userId, clientHomePageList });
    ctx.body = {
      success: true,
      allMessage,
    };
  } catch (error) {
    console.error("Socket => Init Failed |", error.message);
    ctx.body = {
      success: false,
      message: "Init Socket Failed"
    };
  }
};

export const getGroupMember = async (ctx, next) => {
  try {
    const { groupId } = ctx.request.body;
    const { groupService } = ServicesContext.getInstance();
    const members = await groupService.getGroupMember(groupId);
    const onlineSockets = await socketServer.getRoomClients(groupId);

    members.forEach(member => {
      member.status = 0;
      if (member.socketid) {
        const socketIds: string[] = member.socketid.split(",");
        for (const memberSocket of socketIds) {
          const socketExist = onlineSockets.some(socketId => socketId === memberSocket);
          if (socketExist) {
            member.status = 1;
            break;
          }
        }
      }
      delete member.socketid;
    });
    console.log("Socket => GetGroupMember | data:", groupId);

    ctx.body = {
      success: true,
      members,
    };
  } catch (error) {
    console.error("Socket => GetGroupMember Failed |", error.message);
    ctx.body = {
      success: false,
      message: "Get Group Member Failed"
    };
  }
};

export const getGroupMessage = async (ctx, next) => {
  try {
    const { id: userId } = ctx.state.user;
    const { groupId, start, count } = ctx.request.body;
    const { groupChatService, groupService } = ServicesContext.getInstance();
    const isInGroup = await groupService.isInGroup(userId, groupId);
    if (!isInGroup) {
      ctx.body = {
        success: false,
        message: "You are not in this group",
      };
      return;
    }
    const RowDataPacket = await groupChatService.getGroupMsg(
      groupId,
      start - 1,
      count,
    );
    const groupMessages = JSON.parse(JSON.stringify(RowDataPacket));
    console.log("Socket => GetOneGroupMessages | data:", { groupId, start, count });
    ctx.body = {
      success: true,
      groupMessages,
    };
  } catch (error) {
    console.error("Socket => GetOneGroupMessage Failed |", error.message);
    ctx.body = {
      success: false,
      message: "Get Group Message Failed"
    };
  }
};

export const getPrivateMessage = async (ctx, next) => {
  try {
    const { id: userId } = ctx.state.user;
    const { toUser, start, count } = ctx.request.body;
    const { chatService } = ServicesContext.getInstance();

    const RowDataPacket = await chatService.getPrivateDetail(userId, toUser, start - 1, count);
    const privateMessages = JSON.parse(JSON.stringify(RowDataPacket));
    console.log("Socket => GetPrivateMessage | data:", { toUser, start, count });
    ctx.body = {
      success: true,
      privateMessages
    };
  } catch (error) {
    console.error("Socket => GetPrivateMessage Failed |", error.message);
    ctx.body = {
      success: false,
      message: "Get Private Message Failed"
    };
  }
};

export const getUserInfo = async (ctx, next) => {
  try {
    const { userId } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();
    const userInfo: User = await userService.getUserInfoById(userId);
    console.log("Socket => GetUserInfo | userId:", userId);

    ctx.body = {
      success: true,
      userInfo,
    };
  } catch (error) {
    console.error("Socket => GetUserInfo Failed |", error.message);
    ctx.body = {
      success: false,
      message: "Get User Info Failed"
    };
  }
};

export const getOneGroupItem = async (ctx, next) => {
  try {
    const { id: userId } = ctx.state.user;
    const { groupId, start } = ctx.request.body;
    const { groupService } = ServicesContext.getInstance();
    const isInGroup = await groupService.isInGroup(userId, groupId);
    if (!isInGroup) return;

    const groupMsgAndInfo = await getGroupItem({
      groupId,
      start: start || 1,
      count: 20,
    });
    console.log("Socket => GetOneGroupItem | data:", { groupId, start });

    ctx.body = {
      success: true,
      groupMsgAndInfo
    };
  } catch (error) {
    console.error("Socket => GetOneGroupItem Failed |", error.message);
    ctx.body = {
      success: false,
      message: "Get Group Item Failed"
    };
  }
};

export const findMatch = async (ctx, next) => {
  try {
    const { searchUser, field } = ctx.request.body;
    // searchUser : true => find users | searchUser : false => find groups
    const { userService, groupService } = ServicesContext.getInstance();
    let fuzzyMatchResult;
    if (searchUser) {
      fuzzyMatchResult = await userService.findMatchUsers(`%${field}%`);
    } else {
      fuzzyMatchResult = await groupService.findMatchGroups(`%${field}%`);
    }
    ctx.body = {
      success: true,
      fuzzyMatchResult
    };
  } catch (error) {
    console.error("Socket => FindMatch Failed |", error.message);
    ctx.body = {
      success: false,
      message: "Find Match Failed"
    };
  }
};