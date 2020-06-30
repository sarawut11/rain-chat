import * as uuid from "uuid/v1";
import * as moment from "moment";
import * as socketIo from "socket.io";
import { ServicesContext } from "../context";
import { getAllMessage, getGroupItem } from "./message.socket";
import { User, Group } from "../models";
import { isVitaePostEnabled } from "../utils/utils";
import { socketServer } from "./app.socket";
import { socketEventNames } from "./resource.socket";
import configs from "@configs";

export const sendGroupMsg = async (io, socket, data, cbFn) => {
  try {
    const { groupChatService, userService } = ServicesContext.getInstance();
    const user: User[] = await userService.getUserBySocketId(socket.id);
    if (user.length === 0) return;
    if (user[0].role === User.ROLE.FREE) {
      if (!isVitaePostEnabled(user[0]))
        return;
      await userService.resetLastVitaePostTime(user[0].id);
      setTimeout(() => {
        socketServer.emitTo(socket.id, socketEventNames.EnableVitaePost, {});
      }, configs.rain.vitae_post_time);
    }
    if (!data) return;
    data.attachments = JSON.stringify(data.attachments);
    data.time = moment().utc().unix();
    await groupChatService.saveGroupMsg({ ...data });
    socket.broadcast.to(data.groupId).emit("getGroupMsg", data);
    console.log("sendGroupMsg data=>", data, "time=>", new Date().toLocaleString());
    cbFn(data);
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

// get group messages in a group;
export const getOneGroupMessages = async (io, socket, data, cbfn) => {
  try {
    const { groupChatService } = ServicesContext.getInstance();
    const RowDataPacket = await groupChatService.getGroupMsg(
      data.groupId,
      data.start - 1,
      data.count,
    );
    const groupMessages = JSON.parse(JSON.stringify(RowDataPacket));
    console.log("getOneGroupMessages data=>", data, "time=>", new Date().toLocaleString());
    cbfn(groupMessages);
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

// get group item including messages and group info.
export const getOneGroupItem = async (io, socket, data, cbfn) => {
  try {
    const groupMsgAndInfo = await getGroupItem({
      groupId: data.groupId,
      start: data.start || 1,
      count: 20,
    });
    console.log("getOneGroupItem data=>", data, "time=>", new Date().toLocaleString());
    cbfn(groupMsgAndInfo);
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const createGroup = async (io, socket, data, cbfn) => {
  try {
    const { groupService, userService } = ServicesContext.getInstance();
    const groupId = uuid();
    data.createTime = Date.parse(new Date().toString()) / 1000;
    const { name, description, creatorId, createTime } = data;
    const RowDataPacket = await userService.getUserInfoById(creatorId);
    const userInfo = RowDataPacket[0];
    if (userInfo.role !== User.ROLE.OWNER && userInfo.role !== User.ROLE.UPGRADED_USER) {
      console.log("Free Members can't create a group");
      io.to(socket.id).emit("error", { code: 500, message: "Free Members can't create a group" });
    } else {
      const arr = [groupId, name, description, creatorId, createTime];
      await groupService.createGroup(arr);
      await groupService.joinGroup(creatorId, groupId);
      socket.join(groupId);
      console.log("createGroup data=>", data, "time=>", new Date().toLocaleString());
      cbfn({ groupId, ...data });
    }
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const updateGroupInfo = async (io, socket, data, cbfn) => {
  try {
    const { groupService } = ServicesContext.getInstance();
    await groupService.updateGroupInfo(data);
    console.log("updateGroupInfo data=>", data, "time=>", new Date().toLocaleString());
    cbfn("Group data modified successfully");
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const joinGroup = async (io, socket, data, cbfn) => {
  try {
    const { userInfo, toGroupId } = data;
    const { groupService } = ServicesContext.getInstance();

    const joinedThisGroup = (await groupService.isInGroup(userInfo.userId, toGroupId)).length;
    if (!joinedThisGroup) {
      await groupService.joinGroup(userInfo.userId, toGroupId);
      socket.broadcast.to(toGroupId).emit("getGroupMsg", {
        ...userInfo,
        message: `${userInfo.name} joined a group chat`,
        groupId: toGroupId,
        tip: "joinGroup",
      });
    }
    socket.join(toGroupId);
    const groupItem = await getGroupItem({ groupId: toGroupId });
    console.log("joinGroup data=>", data, "time=>", new Date().toLocaleString());
    cbfn(groupItem);
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const leaveGroup = async (io, socket, data) => {
  try {
    const { userId, toGroupId } = data;
    const { groupService } = ServicesContext.getInstance();

    socket.leave(toGroupId);
    await groupService.leaveGroup(userId, toGroupId);
    console.log("leaveGroup data=>", data, "time=>", new Date().toLocaleString());
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const kickMember = async (io, socket: socketIo.Socket, data) => {
  try {
    const { userId, groupId } = data;
    const { userService, groupService } = ServicesContext.getInstance();

    const user: User[] = await userService.getUserBySocketId(socket.id);
    if (user.length === 0) return;
    if (user[0].role !== User.ROLE.UPGRADED_USER) return;

    const group: Group[] = await groupService.getGroupById(groupId);
    if (group.length === 0) return;
    if (group[0].creatorId !== user[0].id) return;

  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const getGroupMember = async (io, socket, groupId, cbfn) => {
  try {
    const { groupChatService } = ServicesContext.getInstance();
    const RowDataPacket = await groupChatService.getGroupMember(groupId);
    const userInfos = JSON.parse(JSON.stringify(RowDataPacket));
    io.in(groupId).clients((err, onlineSockets) => {
      if (err) {
        throw err;
      }
      userInfos.forEach(userInfo => {
        userInfo.status = 0;
        if (userInfo.socketid) {
          const socketIds: string[] = userInfo.socketid.split(",");
          for (const onlineSocket of onlineSockets) {
            const socketExist = socketIds.some(socketId => socketId === onlineSocket);
            if (socketExist) {
              userInfo.status = 1;
            }
          }
        }
        delete userInfo.socketid;
      });
      console.log("getGroupMember data=>", groupId, "time=>", new Date().toLocaleString());
      cbfn(userInfos);
    });
  } catch (error) {
    console.log("error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};