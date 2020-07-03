/* eslint-disable consistent-return */
import * as socketIo from "socket.io";

import { ServicesContext } from "../context";
import { authVerify } from "../middlewares/verify";
import { getAllMessage } from "./message.socket";
import { requestFrequency } from "../middlewares/requestFrequency";
import * as privateSockets from "./private.socket";
import * as groupSockets from "./group.socket";
import * as rainSockets from "./rain.socket";

let io: socketIo.Server;

const initServer = server => {
  const { userService } = ServicesContext.getInstance();

  io = socketIo(server);
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (authVerify(token)) {
      console.log("verify socket token success", token);
      return next();
    }
    return next(new Error(`Authentication error! time =>${new Date().toLocaleString()}`));
  });

  io.on("connection", async socket => {
    const socketId = socket.id;
    let userId;
    let clientHomePageList;
    console.log("connection socketId=>", socketId, "time=>", new Date().toLocaleString());

    // Get data for group chats and private chats
    await emitAsync(socket, "initSocket", socketId, (userID, homePageList) => {
      console.log("userId", userID);
      userId = userID;
      clientHomePageList = homePageList;
    });
    const allMessage = await getAllMessage({ userId, clientHomePageList });
    socket.emit("initSocketSuccess", allMessage);
    console.log("initSocketSuccess userId=>", userId, "time=>", new Date().toLocaleString());

    socket.use((packet, next) => {
      if (!requestFrequency(socketId)) return next();
      next(new Error("Access interface frequently, please try again in a minute!"));
    });

    // init socket
    const arr = await userService.getSocketid(userId);
    const existSocketIdStr = getSocketIdHandle(arr);
    const newSocketIdStr = existSocketIdStr ? `${existSocketIdStr},${socketId}` : socketId;
    await userService.saveUserSocketId(userId, newSocketIdStr);
    console.log("initSocket userId=>", userId, "time=>", new Date().toLocaleString());

    // init GroupChat
    const result = await userService.getGroupList(userId);
    const groupList = JSON.parse(JSON.stringify(result));
    for (const item of groupList) {
      socket.join(item.groupId);
    }
    console.log("initGroupChat userId=>", userId, "time=>", new Date().toLocaleString());

    socket
      // Private message
      .on("sendPrivateMsg", async (data, cbFn) => {
        await privateSockets.sendPrivateMsg(io, socket, data, cbFn);
      })
      .on("getOnePrivateChatMessages", async (data, fn) => {
        await privateSockets.getOnePrivateChatMessages(io, socket, data, fn);
      })
      .on("addAsTheContact", async (data, fn) => {
        privateSockets.addAsTheContact(io, socket, data, fn);
      })
      .on("getUserInfo", async (userID, fn) => {
        await privateSockets.getUserInfo(io, socket, userID, fn);
      })
      .on("deleteContact", async ({ fromUser, toUser }, fn) => {
        await privateSockets.deleteContact(io, socket, { fromUser, toUser }, fn);
      })

      // Group chat
      .on("sendGroupMsg", async (data, cbFn) => {
        await groupSockets.sendGroupMsg(io, socket, data, cbFn);
      })
      .on("getOneGroupMessages", async (data, fn) => {
        await groupSockets.getOneGroupMessages(io, socket, data, fn);
      })
      .on("getOneGroupItem", async (data, fn) => {
        await groupSockets.getOneGroupItem(io, socket, data, fn);
      })
      .on("createGroup", async (data, fn) => {
        await groupSockets.createGroup(io, socket, data, fn);
      })
      .on("updateGroupInfo", async (data, fn) => {
        await groupSockets.updateGroupInfo(io, socket, data, fn);
      })
      .on("joinGroup", async (data, fn) => {
        await groupSockets.joinGroup(io, socket, data, fn);
      })
      .on("leaveGroup", async data => {
        await groupSockets.leaveGroup(io, socket, data);
      })
      .on("kickMember", async (data, fn) => {
        await groupSockets.kickMember(io, socket, data, fn);
      })
      .on("getGroupMember", async (groupId, fn) => {
        await groupSockets.getGroupMember(io, socket, groupId, fn);
      })
      .on("banMember", async (data, fn) => {
        await groupSockets.banMember(io, socket, data, fn);
      })
      .on("findMatch", async ({ field, searchUser }, fn) => {
        groupSockets.findMatch(io, socket, { field, searchUser }, fn);
      })

      // Rain Sockets
      .on("subscribeAdsReward", async ({ token }) => {
        rainSockets.subscribeAdsReward(token);
      })

      // Disconnect
      .on("disconnect", async reason => {
        try {
          const socketid = await userService.getSocketid(userId);
          const existSocketidStr = getSocketIdHandle(socketid);
          const toUserSocketIds = (existSocketidStr && existSocketidStr.split(",")) || [];
          const index = toUserSocketIds.indexOf(socketId);

          if (index > -1) {
            toUserSocketIds.splice(index, 1);
          }

          await userService.saveUserSocketId(userId, toUserSocketIds.join(","));

          // if (toUserSocketIds.length) {
          //   await userService.saveUserSocketId(_userId, toUserSocketIds.join(','));
          // } else {
          //   await Promise.all([
          //     userService.saveUserSocketId(_userId, toUserSocketIds.join(',')),
          //     userService.updateUserStatus(_userId, 0)
          //   ]);
          // }

          console.log("disconnect.=>reason", reason, "userId=>", userId, "socket.id=>", socket.id, "time=>",
            new Date().toLocaleString(),
          );
        } catch (error) {
          console.log("error", error.message);
          io.to(socketId).emit("error", { code: 500, message: error.message });
        }
      });
  });
};

const broadcast = (emitName, data, onError?) => {
  try {
    io.sockets.emit(emitName, data);
  } catch (error) {
    console.log(error);
    if (onError) {
      onError(error);
    }
  }
};

const emitTo = (toSocketIds: string, emitName, data, onError?) => {
  try {
    const socketids = toSocketIds.split(",");
    socketids.forEach(socketid => io.to(socketid).emit(emitName, data));
  } catch (error) {
    if (onError)
      onError(error);
  }
};

const allSocketCount = (): number => {
  return Object.keys(io.sockets.sockets).length;
};

function getSocketIdHandle(arr) {
  return arr[0] ? JSON.parse(JSON.stringify(arr[0])).socketid : "";
}

const getRoomClients = (room): Promise<any> => {
  return new Promise((resolve, reject) => {
    io.of("/").in(room).clients((error, clients) => {
      resolve(clients);
    });
  });
};

function emitAsync(socket: socketIo.Socket, emitName, data, callback) {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.emit) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject("pls input socket");
    }
    socket.emit(emitName, data, (...args) => {
      let response;
      if (typeof callback === "function") {
        response = callback(...args);
      }
      resolve(response);
    });
  });
}

export const socketServer = {
  initServer,
  broadcast,
  emitTo,
  getSocketIdHandle,
  getRoomClients,
  allSocketCount,
  updateAdsStatus: rainSockets.updateAdsStatus
};