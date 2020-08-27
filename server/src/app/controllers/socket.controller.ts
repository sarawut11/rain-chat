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
    ctx.body = {
      success: false,
      message: "Init Socket Failed"
    };
  }
};