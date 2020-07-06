import * as socketIo from "socket.io";
import * as moment from "moment";
import { socketServer } from "./app.socket";
import { ServicesContext } from "../context";
import { User } from "../models";
import { socketEventNames } from "./resource.socket";

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
    console.log("sendPrivateMsg data=>", data, "time=>", new Date().toLocaleString());
    cbFn(data);
  } catch (error) {
    console.log("Socket Error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const getOnePrivateChatMessages = async (io, socket, data, cbFn) => {
  try {
    const { chatService } = ServicesContext.getInstance();

    const { userId, toUser, start, count } = data;
    const RowDataPacket = await chatService.getPrivateDetail(userId, toUser, start - 1, count);
    const privateMessages = JSON.parse(JSON.stringify(RowDataPacket));
    console.log(
      "getOnePrivateChatMessages data=>",
      data,
      "time=>",
      new Date().toLocaleString(),
    );
    cbFn(privateMessages);
  } catch (error) {
    console.log("error", error.message);
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
    const time = moment().utc().unix();
    await userService.addFriendEachOther(userId, fromUser, time);
    const userInfo: User = await userService.getUserInfoById(fromUser);
    console.log("addAsTheContact data=>", data, "time=>", new Date().toLocaleString());
    cbFn(userInfo);
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const getUserInfo = async (io, socket, userId, cbFn) => {
  try {
    const { userService } = ServicesContext.getInstance();
    const userInfo: User = await userService.getUserInfoById(userId);
    console.log("getUserInfo userId=>", userId, "time=>", new Date().toLocaleString());
    cbFn(userInfo);
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const deleteContact = async (io, socket, { fromUser, toUser }, cbFn) => {
  try {
    const { userService } = ServicesContext.getInstance();
    await userService.deleteContact(fromUser, toUser);
    const socketIds = await userService.getSocketid(toUser);
    socketServer.emitTo(socketIds.join(","), socketEventNames.BeDeleted, fromUser);
    console.log(
      "deleteContact userId && toUser =>",
      fromUser,
      toUser,
      "time=>",
      new Date().toLocaleString(),
    );
    cbFn({ code: 200, data: "delete contact successfully" });
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};