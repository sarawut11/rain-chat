import * as socketClient from "socket.io-client";
import * as socketIo from "socket.io";
import { ServicesContext } from "@context";
import { requestFrequency, authVerify } from "@middlewares";
import { socketEventNames, Channels, getAllMessage } from "@sockets";
import * as privateSockets from "./private.socket";
import * as groupSockets from "./group.socket";
import { User } from "@models";

let io: socketIo.Server;
let serverSocket: SocketIOClient.Socket;

const initServer = server => {

  serverSocket = socketClient("http://localhost:3000?token=socket-server", {
    transports: ["websocket"],
  });

  // Server Communication
  serverSocket
    .on("broadcast", ({ emitName, data }) => {
      io.emit(emitName, data);
    })
    .on("broadcastChannel", ({ channelName, emitName, data }) => {
      io.to(channelName).emit(emitName, data);
    })
    .on("emitTo", ({ toUserId, emitName, data }: { toUserId: string, emitName: string, data: any }) => {
      const socketids = Object.keys(io.sockets.sockets);
      const userIds: string[] = toUserId.split(",");
      socketids.forEach(socketid => {
        const socket = io.sockets.sockets[socketid];
        const userId = socket.request.id;
        if (userId !== "" && userIds.includes(`${userId}`))
          socket.emit(emitName, data);
      });
    })
    .on("onlineUserIds", (groupId, cbFn) => {
      const socketIds = Object.keys(io.in(groupId).sockets);
      const userIds: string[] = [];
      socketIds.forEach(socketid => {
        const socket = io.in(groupId).sockets[socketid];
        const userId: string = socket.request.id;
        if (!userIds.includes(userId))
          userIds.push(userId);
      });
      cbFn(userIds.join(","));
    });

  // Client Communication
  io = socketIo(server, {
    transports: ["websocket"],
    pingTimeout: 18000000,
    pingInterval: 25000
  });

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
    console.log("Socket => Connection | socketId:", socketId);

    // Get data for group chats and private chats
    const { userId, clientHomePageList } = await emitAsync(socket, socketEventNames.InitSocket, socketId);
    const allMessage = await getAllMessage({ userId, socketId, clientHomePageList });
    socket.emit(socketEventNames.InitSocketSuccess, allMessage);
    for (const item of allMessage.groupList) {
      socket.join(item.groupId);
    }
    console.log(`Socket => InitSocketSuccess | userId:${userId}`);

    // Join Role Channels
    const role = allMessage.userInfo.role;
    if (role === User.ROLE.OWNER)
      socket.join(Channels.OwnerChannel);
    if (role === User.ROLE.MODERATOR)
      socket.join(Channels.ModerChannel);
    console.log(`Socket => InitGroupChat | userId:${userId}`);

    socket.use((packet, next) => {
      if (!requestFrequency(socketId)) return next();
      next(new Error("Access interface frequently, please try again in a minute!"));
    });

    socket
      // Private message
      .on("sendPrivateMsg", async (data, cbFn) => {
        await privateSockets.sendPrivateMsg({ ...data, userId }, (toUserId, msgData) => {
          serverSocket.emit("emitTo", {
            toUserId,
            emitName: socketEventNames.GetPrivateMsg,
            data: msgData
          });
          cbFn(msgData);
        });
      })
      .on("getOnePrivateChatMessages", async (data, cbFn) => {
        await privateSockets.getOnePrivateChatMessages({ ...data, userId }, cbFn);
      })
      .on("addAsTheContact", async (data, cbFn) => {
        await privateSockets.addAsTheContact({ ...data, userId }, cbFn);
      })
      .on("getUserInfo", async (userID, cbFn) => {
        await privateSockets.getUserInfo(userID, cbFn);
      })
      .on("deleteContact", async (data, cbFn) => {
        await privateSockets.deleteContact({ ...data, userId }, (toUserId, fromUser, data) => {
          serverSocket.emit("emitTo", {
            toUserId,
            emitName: socketEventNames.BeDeleted,
            data: fromUser
          });
          cbFn(data);
        });
      })

      // Group Message
      .on("sendGroupMsg", async (data, cbFn) => {
        await groupSockets.sendGroupMsg({ ...data, userId }, (toUserId, emitName, data) => {
          serverSocket.emit("emitTo", {
            toUserId,
            emitName,
            data,
          });
        }, (groupId, emitName, data) => {
          serverSocket.emit("broadcastChannel", {
            channelName: groupId,
            emitName,
            data,
          });
        });
      })
      .on("getOneGroupMessages", async (data, cbFn) => {
        await groupSockets.getOneGroupMessages({ ...data, userId }, cbFn);
      })
      .on("getOneGroupItem", async (data, cbFn) => {
        await groupSockets.getOneGroupItem({ ...data, userId }, cbFn);
      })
      .on("createGroup", async (data, cbFn) => {
        await groupSockets.createGroup(socket, { ...data, userId }, cbFn);
      })
      .on("updateGroupInfo", async (data, cbFn) => {
        await groupSockets.updateGroupInfo({ ...data, userId }, cbFn);
      })
      .on("joinGroup", async (data, cbFn) => {
        await groupSockets.joinGroup(socket, { ...data, userId }, (groupId, emitName, data) => {
          serverSocket.emit("broadcastChannel", {
            channelName: groupId,
            emitName,
            data,
          });
        }, cbFn);
      })
      .on("leaveGroup", async data => {
        await groupSockets.leaveGroup(socket, { ...data, userId });
      })
      .on("kickMember", async (data, cbFn) => {
        await groupSockets.kickMember({ ...data, ownerId: userId }, (toUserId, emitName, data) => {
          serverSocket.emit("emitTo", {
            toUserId,
            emitName,
            data,
          });
        }, cbFn);
      })
      .on("banMember", async (data, cbFn) => {
        await groupSockets.banMember({ ...data, ownerId: userId }, (toUserId, emitName, data) => {
          serverSocket.emit("emitTo", {
            toUserId,
            emitName,
            data,
          });
        }, cbFn);
      })
      .on("findMatch", async (data, cbFn) => {
        await groupSockets.findMatch(data, cbFn);
      })
      .on("getGroupMember", async (groupId, cbFn) => {
        serverSocket.emit("getGroupMember", groupId, cbFn);
      })
      .on("subscribeAdsReward", async (data) => {
        serverSocket.emit("subscribeAdsReward", data);
      })

      .on("disconnect", async reason => {
        try {
          console.log(`Socket => Disconnect | reason:${reason} userId:${userId}, socketId:${socket.id}`);
          const { userService } = ServicesContext.getInstance();
          await userService.setStatus(userId, User.STATUS.OFFLINE);
        } catch (error) {
          console.log("Socket => Disconnect | Error:", error.message);
        }
      });
  });
};

const emitAsync = (socket, emitName, data): Promise<any> => {
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

export const socketServer = {
  initServer,
};