import * as socketIo from "socket.io";
import { ServicesContext } from "@context";
import { getAllMessage, subscribeAdsReward } from "@sockets";
import * as privateSockets from "./private.socket";
import * as groupSockets from "./group.socket";

let io: socketIo.Server;

const initServer = server => {
  io = socketIo(server, {
    transports: ["websocket"],
    pingInterval: 25000,
    pingTimeout: 18000000
  });

  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (token === "socket-server") {
      console.log("Socket => Server socket connected");
      return next();
    }
    return next(new Error(`Socket => Authentication error`));
  });

  io.on("connection", async socket => {
    socket
      .on("initSocket", async (data, cbFn) => {
        const allMessages = await getAllMessage(data);
        cbFn(allMessages);
      })
      // Private message
      .on("sendPrivateMsg", async (data, cbFn) => {
        await privateSockets.sendPrivateMsg(socket, data, cbFn);
      })
      .on("getOnePrivateChatMessages", async (data, fn) => {
        await privateSockets.getOnePrivateChatMessages(socket, data, fn);
      })
      .on("addAsTheContact", async (data, fn) => {
        privateSockets.addAsTheContact(socket, data, fn);
      })
      .on("getUserInfo", async (userID, fn) => {
        await privateSockets.getUserInfo(socket, userID, fn);
      })
      .on("deleteContact", async (data, fn) => {
        await privateSockets.deleteContact(socket, data, fn);
      })
      // Group chat
      .on("sendGroupMsg", async (data, cbFn) => {
        await groupSockets.sendGroupMsg(data, cbFn);
      })
      .on("getOneGroupMessages", async (data, fn) => {
        await groupSockets.getOneGroupMessages(data, fn);
      })
      .on("getOneGroupItem", async (data, fn) => {
        await groupSockets.getOneGroupItem(data, fn);
      })
      .on("createGroup", async (data, fn) => {
        await groupSockets.createGroup(data, fn);
      })
      .on("updateGroupInfo", async (data, fn) => {
        await groupSockets.updateGroupInfo(data, fn);
      })
      .on("joinGroup", async (data, fn) => {
        await groupSockets.joinGroup(data, fn);
      })
      .on("leaveGroup", async data => {
        await groupSockets.leaveGroup(data);
      })
      .on("kickMember", async (data, fn) => {
        await groupSockets.kickMember(data, fn);
      })
      .on("getGroupMember", async (groupId, fn) => {
        const online = await onlineSockets(groupId);
        await groupSockets.getGroupMember({
          groupId,
          onlineSockets: online
        }, fn);
      })
      .on("banMember", async (data, fn) => {
        await groupSockets.banMember(data, fn);
      })
      .on("findMatch", async (data, fn) => {
        await groupSockets.findMatch(data, fn);
      })

      // Rain Sockets
      .on("subscribeAdsReward", async ({ token }) => {
        subscribeAdsReward(token);
      })

      // Disconnect
      .on("disconnected", async ({ reason, userId, socketId }) => {
        try {
          const { userService } = ServicesContext.getInstance();
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

        } catch (error) {
          console.log("Socket => Disconnect | Error:", error.message);
        }
      });
  });
};

const broadcast = (emitName, data, onError?) => {
  try {
    io.sockets.emit("broadcast", { emitName, data });
  } catch (error) {
    console.log(error);
    if (onError) {
      onError(error);
    }
  }
};

const broadcastChannel = (channelName: string, emitName: string, data: any, onError?) => {
  try {
    io.sockets.emit("broadcastChannel", { channelName, emitName, data });
  } catch (error) {
    console.log(error);
    if (onError) {
      onError(error);
    }
  }
};

const emitGetResponse = (socket: socketIo.Socket, emitName: string, data): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      socket.emit(emitName, data, response => {
        resolve(response);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const onlineSockets = (groupId): Promise<string[]> => new Promise(async (resolve, reject) => {
  try {
    const onlineSockets = await Promise.all(Object.keys(io.sockets.sockets).map(key => {
      return emitGetResponse(io.sockets.sockets[key], "onlineSockets", groupId);
    }));
    resolve(onlineSockets.join(",").split(","));
  } catch (error) {
    reject(error);
  }
});

const emitTo = (toSocketIds: string, emitName, data, onError?) => {
  try {
    io.sockets.emit("emitTo", { toSocketIds, emitName, data });
  } catch (error) {
    if (onError)
      onError(error);
  }
};

export const socketServer = {
  initServer,
  broadcast,
  broadcastChannel,
  emitTo,
  onlineSockets,
};