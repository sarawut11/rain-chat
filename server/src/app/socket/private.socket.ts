import { socketServer } from "./app.socket";
import { ServicesContext } from "../context";

export const sendPrivateMsg = async (io, socket, data, cbFn) => {
  try {
    const { chatService, userService } = ServicesContext.getInstance();

    if (!data) return;
    data.time = Date.parse(new Date().toString()) / 1000;
    await Promise.all([
      chatService.savePrivateMsg({
        ...data,
        attachments: JSON.stringify(data.attachments),
      }),
      userService.getUserSocketId(data.to_user).then(arr => {
        const existSocketIdStr = socketServer.getSocketIdHandle(arr);
        const toUserSocketIds = (existSocketIdStr && existSocketIdStr.split(",")) || [];

        toUserSocketIds.forEach(e => {
          io.to(e).emit("getPrivateMsg", data);
        });
      }),
    ]);
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

    const { user_id, toUser, start, count } = data;
    const RowDataPacket = await chatService.getPrivateDetail(user_id, toUser, start - 1, count);
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
 * @param  user_id    Local user
 * @param  from_user  Friends of the local user (the other party)
 */
export const addAsTheContact = async (io, socket, data, cbFn) => {
  try {
    const { user_id, from_user } = data;
    const { userService } = ServicesContext.getInstance();
    const time = Date.now() / 1000;
    await userService.addFriendEachOther(user_id, from_user, time);
    const userInfo = await userService.getUserInfoById(from_user);
    console.log("addAsTheContact data=>", data, "time=>", new Date().toLocaleString());
    cbFn(userInfo[0]);
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const getUserInfo = async (io, socket, user_id, cbFn) => {
  try {
    const { userService } = ServicesContext.getInstance();
    const userInfo = await userService.getUserInfoById(user_id);
    console.log("getUserInfo user_id=>", user_id, "time=>", new Date().toLocaleString());
    cbFn(userInfo[0]);
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const deleteContact = async (io, socket, { from_user, to_user }, cbFn) => {
  try {
    const { userService } = ServicesContext.getInstance();
    await userService.deleteContact(from_user, to_user);
    const sockets = await userService.getUserSocketId(to_user);
    const existSocketIdStr = socketServer.getSocketIdHandle(sockets);
    const toUserSocketIds = (existSocketIdStr && existSocketIdStr.split(",")) || [];
    toUserSocketIds.forEach(e => {
      io.to(e).emit("beDeleted", from_user);
    });
    console.log(
      "deleteContact user_id && to_user =>",
      from_user,
      to_user,
      "time=>",
      new Date().toLocaleString(),
    );
    cbFn({ code: 200, data: "delete contact successfully" });
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};