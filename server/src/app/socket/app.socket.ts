import * as socketClient from "socket.io-client";

import { ServicesContext } from "@context";
import { getAllMessage, subscribeAdsReward } from "@sockets";
import * as privateSockets from "./private.socket";
import * as groupSockets from "./group.socket";

let socket = socketClient.Socket;

const initServer = () => {

  socket = socketClient("http://localhost:3030?token=rain-chat-server");

  socket.on("connect", () => {
    socket.on("initSocket", async (data, cbFn) => {
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
        await groupSockets.sendGroupMsg(socket, data, cbFn);
      })
      .on("getOneGroupMessages", async (data, fn) => {
        await groupSockets.getOneGroupMessages(socket, data, fn);
      })
      .on("getOneGroupItem", async (data, fn) => {
        await groupSockets.getOneGroupItem(socket, data, fn);
      })
      .on("createGroup", async (data, fn) => {
        await groupSockets.createGroup(socket, data, fn);
      })
      .on("updateGroupInfo", async (data, fn) => {
        await groupSockets.updateGroupInfo(socket, data, fn);
      })
      .on("joinGroup", async (data, fn) => {
        await groupSockets.joinGroup(socket, data, fn);
      })
      .on("leaveGroup", async data => {
        await groupSockets.leaveGroup(socket, data);
      })
      .on("kickMember", async (data, fn) => {
        await groupSockets.kickMember(socket, data, fn);
      })
      .on("getGroupMember", async (data, fn) => {
        await groupSockets.getGroupMember(socket, data, fn);
      })
      .on("banMember", async (data, fn) => {
        await groupSockets.banMember(socket, data, fn);
      })
      .on("findMatch", async (data, fn) => {
        await groupSockets.findMatch(socket, data, fn);
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
    socket.emit("broadcast", { emitName, data });
  } catch (error) {
    console.log(error);
    if (onError) {
      onError(error);
    }
  }
};

const broadcastChannel = (channelName: string, emitName: string, data: any, onError?) => {
  try {
    socket.emit("broadcastChannel", { channelName, emitName, data });
  } catch (error) {
    console.log(error);
    if (onError) {
      onError(error);
    }
  }
};

const emitTo = (toSocketIds: string, emitName, data, onError?) => {
  try {
    socket.emit("emitTo", { toSocketIds, emitName, data });
  } catch (error) {
    if (onError)
      onError(error);
  }
};

const allSocketCount = (): Promise<number> => new Promise((resolve, reject) => {
  socket.emit("allSocketCount", count => {
    resolve(count);
  });
});

export const socketServer = {
  initServer,
  broadcast,
  broadcastChannel,
  emitTo,
  allSocketCount,
};