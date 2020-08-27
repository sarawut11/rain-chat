/* eslint-disable consistent-return */
import * as socketIo from "socket.io";

import { ServicesContext } from "@context";
import { requestFrequency, authVerify } from "@middlewares";
import { getAllMessage, subscribeAdsReward, socketEventNames, Channels } from "@sockets";
import * as privateSockets from "./private.socket";
import * as groupSockets from "./group.socket";
import { User } from "@models";

let io: socketIo.Server;

const initServer = server => {
  const { userService } = ServicesContext.getInstance();

  io = socketIo(server);
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    const result = authVerify(token);
    if (result) {
      console.log("Socket => Verify socket token | success");
      socket.request.id = result.id;
      socket.request.username = result.username;
      return next();
    }
    return next(new Error(`Socket => Authentication error`));
  });

  io.on("connection", async socket => {
    const socketId = socket.id;
    const userId = socket.request.id;
    console.log(`Socket => Connection | socketId:${socketId}, userId:${userId}`);

    socket.use((packet, next) => {
      if (!requestFrequency(socketId)) return next();
      console.error("Access interface frequently, please try again in a minute!");
      next(new Error("Access interface frequently, please try again in a minute!"));
    });

    // init socket
    const socketIds = await userService.getSocketid(userId);
    socketIds.push(socketId);
    const newSocketIdStr = socketIds.join(",");
    await userService.saveUserSocketId(userId, newSocketIdStr);
    console.log(`Socket => InitSocket | userId:${userId}`);

    // init GroupChat
    const result = await userService.getGroupList(userId);
    const groupList = JSON.parse(JSON.stringify(result));
    for (const item of groupList) {
      socket.join(item.groupId);
    }

    // Join Role Channels
    const user = await userService.findUserById(userId);
    if (user.role === User.ROLE.OWNER)
      socket.join(Channels.OwnerChannel);
    if (user.role === User.ROLE.MODERATOR)
      socket.join(Channels.ModerChannel);
    console.log(`Socket => InitGroupChat | userId:${userId}`);

    socket
      // Private message
      .on("sendPrivateMsg", async (data, cbFn) => {
        await privateSockets.sendPrivateMsg(io, socket, data, cbFn);
      })
      .on("addAsTheContact", async (data, fn) => {
        privateSockets.addAsTheContact(io, socket, data, fn);
      })
      .on("getUserInfo", async (userID, fn) => {
        await privateSockets.getUserInfo(io, socket, userID, fn);
      })
      .on("deleteContact", async (data, fn) => {
        await privateSockets.deleteContact(io, socket, data, fn);
      })

      // Group chat
      .on("sendGroupMsg", async (data, cbFn) => {
        await groupSockets.sendGroupMsg(io, socket, data, cbFn);
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
      .on("banMember", async (data, fn) => {
        await groupSockets.banMember(io, socket, data, fn);
      })
      .on("findMatch", async ({ field, searchUser }, fn) => {
        groupSockets.findMatch(io, socket, { field, searchUser }, fn);
      })

      // Rain Sockets
      .on("subscribeAdsReward", async ({ token }) => {
        subscribeAdsReward(token);
      })

      // Disconnect
      .on("disconnect", async reason => {
        try {
          const socketids = await userService.getSocketid(userId);
          const index = socketids.indexOf(socketId);

          if (index > -1) {
            socketids.splice(index, 1);
          }

          await userService.saveUserSocketId(userId, socketids.join(","));

          // if (toUserSocketIds.length) {
          //   await userService.saveUserSocketId(_userId, toUserSocketIds.join(','));
          // } else {
          //   await Promise.all([
          //     userService.saveUserSocketId(_userId, toUserSocketIds.join(',')),
          //     userService.updateUserStatus(_userId, 0)
          //   ]);
          // }

          console.log(`Socket => Disconnect | reason:${reason} userId:${userId}, socketId:${socket.id}`);
        } catch (error) {
          console.log("Socket => Disconnect | Error:", error.message);
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

const broadcastChannel = (channelName: string, emitName: string, data: any, onError?) => {
  try {
    io.to(channelName).emit(emitName, data);
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
    socketids.forEach(socketid => {
      if (socketid !== "" && socketid !== undefined)
        io.to(socketid).emit(emitName, data);
    });
  } catch (error) {
    if (onError)
      onError(error);
  }
};

const allSocketCount = (): number => {
  return Object.keys(io.sockets.sockets).length;
};

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
  server: io,
  initServer,
  broadcast,
  broadcastChannel,
  emitTo,
  getRoomClients,
  allSocketCount,
};