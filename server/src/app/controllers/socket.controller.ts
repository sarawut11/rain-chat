import { ServicesContext } from "@context";
import { socketServer, getAllMessage } from "@sockets";

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