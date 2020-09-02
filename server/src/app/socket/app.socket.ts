import * as socketIo from "socket.io";
import { subscribeAdsReward } from "@sockets";
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
      .on("getGroupMember", async (groupId, fn) => {
        const online = await onlineUsers(groupId);
        await groupSockets.getGroupMember({
          groupId,
          onlineUsers: online
        }, fn);
      })

      // Rain Sockets
      .on("subscribeAdsReward", async ({ token }) => {
        subscribeAdsReward(token);
      })
      .on("emitTo", ({ toUserId, emitName, data }) => {
        emitTo(toUserId, emitName, data);
      })
      .on("broadcast", ({ emitName, data }) => {
        broadcast(emitName, data);
      })
      .on("broadcastChannel", ({ channelName, emitName, data }) => {
        broadcastChannel(channelName, emitName, data);
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

const onlineUsers = (groupId): Promise<string[]> => new Promise(async (resolve, reject) => {
  try {
    const onlineSockets = await Promise.all(Object.keys(io.sockets.sockets).map(key => {
      return emitGetResponse(io.sockets.sockets[key], "onlineUserIds", groupId);
    }));
    resolve(onlineSockets.join(",").split(","));
  } catch (error) {
    reject(error);
  }
});

const emitTo = (toUserId, emitName, data, onError?) => {
  try {
    io.sockets.emit("emitTo", { toUserId: `${toUserId}`, emitName, data });
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
  onlineUsers,
};