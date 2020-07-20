import * as uuid from "uuid/v1";
import { User, Group } from "@models";
import { ServicesContext } from "@context";
import { isVitaePostEnabled, now, nowDate } from "@utils";
import { socketServer, getGroupItem, socketEventNames } from "@sockets";

const RAIN_GROUP_ID = process.env.RAIN_GROUP_ID;
const VITAE_POST_TIME = Number(process.env.VITAE_POST_TIME);

export const sendGroupMsg = async (io, socket, data, cbFn) => {
  try {
    const { groupChatService, userService } = ServicesContext.getInstance();
    const user: User = await userService.getUserBySocketId(socket.id);
    if (user === undefined) return;
    if (user.ban === User.BAN.BANNED) return;
    if (user.role === User.ROLE.FREE && data.groupId === RAIN_GROUP_ID) {
      if (!isVitaePostEnabled(user))
        return;
      await userService.resetLastVitaePostTime(user.id);
      setTimeout(() => {
        socketServer.emitTo(socket.id, socketEventNames.EnableVitaePost, {});
      }, VITAE_POST_TIME);
    }
    if (!data) return;
    data.attachments = JSON.stringify(data.attachments);
    data.time = now();
    await groupChatService.saveGroupMsg({ ...data });
    socket.broadcast.to(data.groupId).emit(socketEventNames.GetGroupMsg, data);
    console.log(`Socket => SendGroupMsg | data:${data}`);
    cbFn(data);
  } catch (error) {
    console.log("Socket => Send Group Msg | Error:", error.message);
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
    console.log("Socket => GetOneGroupMessages | data:", data);
    cbfn(groupMessages);
  } catch (error) {
    console.log("Socket => GetOneGroupMessages | error", error.message);
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
    console.log("Socket => GetOneGroupItem | data:", data);
    cbfn(groupMsgAndInfo);
  } catch (error) {
    console.log("Socket => GetOneGroupItem | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const createGroup = async (io, socket, data, cbfn) => {
  try {
    const { groupService, userService } = ServicesContext.getInstance();
    const groupId = uuid();
    data.createTime = now();
    const { name, description, creatorId, createTime } = data;
    const userInfo: User = await userService.findUserById(creatorId);
    if (userInfo.role !== User.ROLE.OWNER && userInfo.role !== User.ROLE.UPGRADED_USER) {
      console.log("Socket => Create Group | Failed | Free members can't create a group");
      io.to(socket.id).emit("error", { code: 500, message: "Free Members can't create a group" });
    } else {
      const arr = [groupId, name, description, creatorId, createTime];
      await groupService.createGroup(arr);
      await groupService.joinGroup(creatorId, groupId);
      socket.join(groupId);
      console.log("Socket => Create Group | data:", data, "time:", new Date().toLocaleString());
      cbfn({ groupId, ...data });
    }
  } catch (error) {
    console.log("Socket => Create Group | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const updateGroupInfo = async (io, socket, data, cbfn) => {
  try {
    const { groupService } = ServicesContext.getInstance();
    await groupService.updateGroupInfo(data);
    console.log("Socket => UpdateGroupInfo | data:", data, "time:", new Date().toLocaleString());
    cbfn("Group data modified successfully");
  } catch (error) {
    console.log("Socket => Update Group Info | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const joinGroup = async (io, socket, data, cbfn) => {
  try {
    const { userInfo, groupId } = data;
    const { groupService } = ServicesContext.getInstance();

    const joinedThisGroup = (await groupService.isInGroup(userInfo.userId, groupId)).length;
    if (!joinedThisGroup) {
      await groupService.joinGroup(userInfo.userId, groupId);
      socket.broadcast.to(groupId).emit(socketEventNames.GetGroupMsg, {
        ...userInfo,
        message: `${userInfo.name} joined a group chat`,
        groupId,
        tip: "joinGroup",
      });
    }
    socket.join(groupId);
    const groupItem = await getGroupItem({ groupId });
    console.log("Socket => JoinGroup | data:", data, "time:", nowDate());
    cbfn(groupItem);
  } catch (error) {
    console.log("Socket => Join Group | Error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const leaveGroup = async (io, socket, data) => {
  try {
    const { userId, groupId } = data;
    const { groupService } = ServicesContext.getInstance();

    socket.leave(groupId);
    await groupService.leaveGroup(userId, groupId);
    console.log("Socket => LeaveGroup | data:", data, "time:", nowDate());
  } catch (error) {
    console.log("Socket => Leave Group | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const kickMember = async (io, socket, data, cbFn) => {
  try {
    console.log("Socket => Kick member request | data:", data);
    const { userId, groupId } = data;
    const { userService, groupService } = ServicesContext.getInstance();

    const user: User = await userService.getUserBySocketId(socket.id);
    if (user === undefined) return;

    const group: Group = await groupService.getGroupByGroupId(groupId);
    if (group === undefined) return;
    if (group.creatorId !== user.id) return;

    await groupService.leaveGroup(userId, groupId);
    const kicker: User = await userService.findUserById(userId);
    if (kicker !== undefined)
      socketServer.emitTo(kicker.socketid, socketEventNames.KickedFromGroup, { groupId });
    console.log("Socket => KickMember | data:", data, "time:", nowDate());
    cbFn({ code: 200, data: "Kicked member successfully" });
  } catch (error) {
    console.log("Socket => Kick Member | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const banMember = async (io, socket, { userId, groupId }, cbfn) => {
  try {
    const { groupService, userService, banService } = ServicesContext.getInstance();
    const user: User = await userService.getUserBySocketId(socket.id);
    if (user === undefined) return;

    if (groupId === RAIN_GROUP_ID) { // Vitae Rain Group
      // Check Group Ownership
      if (user.role !== User.ROLE.OWNER && user.role !== User.ROLE.MODERATOR) return;

      // Ban user from vitae-rain group
      await groupService.leaveGroup(userId, groupId);
      await banService.banUserFromGroup(userId, groupId);
      await userService.banUserFromRainGroup(userId);
      const kicker: User = await userService.findUserById(userId);
      if (kicker !== undefined)
        socketServer.emitTo(kicker.socketid, socketEventNames.KickedFromGroup, { groupId });
    } else {  // General Group
      // Check Group Ownership
      const group = await groupService.getGroupByGroupId(groupId);
      if (group === undefined) return;
      if (group.creatorId !== user.id) return;

      // Ban user from group
      await groupService.leaveGroup(userId, groupId);
      await banService.banUserFromGroup(userId, groupId);
      const kicker: User = await userService.findUserById(userId);
      if (kicker !== undefined)
        socketServer.emitTo(kicker.socketid, socketEventNames.KickedFromGroup, { groupId });
    }
    console.log(`Socket => BanMember | User:${userId} from Group:${groupId} | time: ${nowDate()}`);
    cbfn({ code: 200, data: "ban member successfully" });
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
      console.log("Socket => GetGroupMember | data:", groupId, "time:", nowDate().unix());
      cbfn(userInfos);
    });
  } catch (error) {
    console.log("Socket => Get Group Member | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const findMatch = async (io, socket, { field, searchUser }, cbFn) => {
  try {
    // searchUser : true => find users | searchUser : false => find groups
    const { userService, groupService } = ServicesContext.getInstance();
    let fuzzyMatchResult;
    field = `%${field}%`;
    if (searchUser) {
      fuzzyMatchResult = await userService.findMatchUsers(field);
    } else {
      fuzzyMatchResult = await groupService.findMatchGroups(field);
    }
    cbFn({ fuzzyMatchResult, searchUser });
  } catch (error) {
    console.log("Socket => Find Match | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};