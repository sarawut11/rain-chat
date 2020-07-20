import * as socketIo from "socket.io";
import { User } from "@models";
import { ServicesContext } from "@context";
import { socketServer, socketEventNames } from "@sockets";
import { now, nowDate } from "@utils";

export const sendPrivateMsg = async (io, socket: socketIo.Socket, data, cbFn) => {
  try {
    const { chatService, userService } = ServicesContext.getInstance();

    if (!data) return;
    data.time = Date.parse(new Date().toString()) / 1000;
    await chatService.savePrivateMsg({
      ...data,
      attachments: JSON.stringify(data.attachments),
    });

    const user: User = await userService.findUserById(data.toUser);
    const existSocketIdStr = socketServer.getSocketIdHandle(user.socketid);
    socketServer.emitTo(existSocketIdStr, socketEventNames.GetPrivateMsg, data);
    console.log("Socket => SendPrivateMsg | data:", data, "time:", nowDate());
    cbFn(data);
  } catch (error) {
    console.log("Socket => SendPrivateMsg | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const getOnePrivateChatMessages = async (io, socket, data, cbFn) => {
  try {
    const { chatService } = ServicesContext.getInstance();

    const { userId, toUser, start, count } = data;
    const RowDataPacket = await chatService.getPrivateDetail(userId, toUser, start - 1, count);
    const privateMessages = JSON.parse(JSON.stringify(RowDataPacket));
    console.log("Socket => GetOnePrivateChatMessages | data:", data, "time:", nowDate());
    cbFn(privateMessages);
  } catch (error) {
    console.log("Socket => GetOnePrivateChatMessages | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

/**
 * Add as contact
 * @param  userId    Local user
 * @param  fromUser  Friends of the local user (the other party)
 */
export const addAsTheContact = async (io, socket, data, cbFn) => {
  try {
    const { userId, fromUser } = data;
    const { userService } = ServicesContext.getInstance();
    await userService.addFriendEachOther(userId, fromUser, now());
    const userInfo: User = await userService.getUserInfoById(fromUser);
    console.log("Socket => AddAsTheContact | data:", data, "time:", nowDate());
    cbFn(userInfo);
  } catch (error) {
    console.log("Socket => AddAsTheContact | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const getUserInfo = async (io, socket, userId, cbFn) => {
  try {
    const { userService } = ServicesContext.getInstance();
    const userInfo: User = await userService.getUserInfoById(userId);
    console.log("Socket => GetUserInfo | userId:", userId, "time:", nowDate());
    cbFn(userInfo);
  } catch (error) {
    console.log("Socket => GetUserInfo | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const deleteContact = async (io, socket, { fromUser, toUser }, cbFn) => {
  try {
    const { userService } = ServicesContext.getInstance();
    await userService.deleteContact(fromUser, toUser);
    const socketIds = await userService.getSocketid(toUser);
    socketServer.emitTo(socketIds.join(","), socketEventNames.BeDeleted, fromUser);
    console.log(`Socket => DeleteContact | userId:${fromUser}, toUser:${toUser}, time:${nowDate()}`);
    cbFn({ code: 200, data: "delete contact successfully" });
  } catch (error) {
    console.log("Socket => Delete Contact | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};