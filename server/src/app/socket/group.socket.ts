import * as uuid from "uuid/v1";
import { ServicesContext } from "../context";
import { getAllMessage, getGroupItem } from "./message.socket";

export const sendGroupMsg = async (io, socket, data, cbFn) => {
  try {
    const { groupChatService } = ServicesContext.getInstance();
    if (!data) return;
    data.attachments = JSON.stringify(data.attachments);
    data.time = Date.parse(new Date().toString()) / 1000;
    await groupChatService.saveGroupMsg({ ...data });
    socket.broadcast.to(data.to_group_id).emit("getGroupMsg", data);
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
    const { groupService } = ServicesContext.getInstance();
    const to_group_id = uuid();
    data.create_time = Date.parse(new Date().toString()) / 1000;
    const { name, group_notice, creator_id, create_time } = data;
    const arr = [to_group_id, name, group_notice, creator_id, create_time];
    await groupService.createGroup(arr);
    await groupService.joinGroup(creator_id, to_group_id);
    socket.join(to_group_id);
    console.log("createGroup data=>", data, "time=>", new Date().toLocaleString());
    cbfn({ to_group_id, ...data });
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

    const joinedThisGroup = (await groupService.isInGroup(userInfo.user_id, toGroupId)).length;
    if (!joinedThisGroup) {
      await groupService.joinGroup(userInfo.user_id, toGroupId);
      socket.broadcast.to(toGroupId).emit("getGroupMsg", {
        ...userInfo,
        message: `${userInfo.name} joined a group chat`,
        to_group_id: toGroupId,
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
    const { user_id, toGroupId } = data;
    const { groupService } = ServicesContext.getInstance();

    socket.leave(toGroupId);
    await groupService.leaveGroup(user_id, toGroupId);
    console.log("leaveGroup data=>", data, "time=>", new Date().toLocaleString());
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
          const socketIds = userInfo.socketid.split(",");
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