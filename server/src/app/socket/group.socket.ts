import * as uuid from "uuid/v1";
import { User, Group, Setting, GroupMessage } from "@models";
import { ServicesContext } from "@context";
import { isVitaePostEnabled, now, nowDate } from "@utils";
import { socketServer, getGroupItem, socketEventNames } from "@sockets";

const RAIN_GROUP_ID = process.env.RAIN_GROUP_ID;

export const sendGroupMsg = async (io, socket, data: GroupMessage, cbFn) => {
  try {
    if (data.fromUser !== socket.request.id) {
      console.log("Socket => Send Group Msg | Cracked | userId:", socket.request.id);
      return;
    }

    const { groupChatService, userService, settingService } = ServicesContext.getInstance();
    const user: User = await userService.getUserBySocketId(socket.id);
    if (user === undefined) return;
    if (user.id !== data.fromUser) return;
    if (user.ban === User.BAN.BANNED) return;
    if (user.role === User.ROLE.FREE && data.groupId === RAIN_GROUP_ID) {
      const vitaePostEnabled = await isVitaePostEnabled(user);
      if (!vitaePostEnabled)
        return;

      const vitaePostTime: number = await settingService.getSettingValue(Setting.KEY.VITAE_POST_TIME);
      data.message = await settingService.getSettingValue(Setting.KEY.VITAE_POST_TEXT);
      await userService.resetLastVitaePostTime(user.id);
      setTimeout(() => {
        socketServer.emitTo(socket.id, socketEventNames.EnableVitaePost, {});
      }, vitaePostTime);
    }
    if (!data) return;
    data.attachments = JSON.stringify(data.attachments);
    data.avatar = user.avatar;
    data.time = now();
    await groupChatService.saveGroupMsg({ ...data });
    socket.broadcast.to(data.groupId).emit(socketEventNames.GetGroupMsg, data);
    console.log("Socket => SendGroupMsg | data:", data);
    cbFn(data);
  } catch (error) {
    console.log("Socket => Send Group Msg | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const createGroup = async (io, socket, { name, description }, cbfn) => {
  try {
    const creatorId: number = socket.request.id;
    const { groupService, userService } = ServicesContext.getInstance();
    const groupId = uuid();
    const createTime = now();
    const userInfo: User = await userService.findUserById(creatorId);
    if (userInfo.role !== User.ROLE.OWNER && userInfo.role !== User.ROLE.UPGRADED_USER && userInfo.role !== User.ROLE.MODERATOR) {
      console.log("Socket => Create Group | Failed | Free members can't create a group");
      io.to(socket.id).emit("error", { code: 500, message: "Free Members can't create a group" });
    } else {
      const groupInfo = { groupId, name, description, creatorId, createTime };
      await groupService.createGroup(groupInfo);
      await groupService.joinGroup(creatorId, groupId);
      socket.join(groupId);
      console.log("Socket => Create Group | data:", groupInfo, "time:", new Date().toLocaleString());
      cbfn(groupInfo);
    }
  } catch (error) {
    console.log("Socket => Create Group | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const updateGroupInfo = async (io, socket, { groupId, name, description }, cbfn) => {
  try {
    const creatorId: number = socket.request.id;
    const { groupService } = ServicesContext.getInstance();
    const groupInfo = await groupService.getGroupByGroupId(groupId);
    if (groupInfo.creatorId !== creatorId) return;

    await groupService.updateGroupInfo(groupId, name, description);
    console.log("Socket => UpdateGroupInfo | data:", { groupId, name, description }, "time:", new Date().toLocaleString());
    cbfn("Group data modified successfully");
  } catch (error) {
    console.log("Socket => Update Group Info | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const joinGroup = async (io, socket, { groupId }, cbfn) => {
  try {
    const userId: number = socket.request.id;
    const { userService, groupService } = ServicesContext.getInstance();

    const userInfo = await userService.findUserById(userId);
    const isInGroup = await groupService.isInGroup(userId, groupId);
    console.log(isInGroup);
    if (!isInGroup) {
      await groupService.joinGroup(userId, groupId);
      socketServer.broadcastChannel(groupId, socketEventNames.GetGroupMsg, {
        id: userInfo.id,
        username: userInfo.username,
        name: userInfo.name,
        avatar: userInfo.avatar,
        intro: userInfo.intro,
        message: `${userInfo.name} joined a group chat`,
        groupId,
        tip: "joinGroup",
      });
    }
    socket.join(groupId);
    console.log("Socket => JoinGroup | data:", { groupId, userId }, "time:", nowDate());
  } catch (error) {
    console.log("Socket => Join Group | Error", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const leaveGroup = async (io, socket, { groupId }) => {
  try {
    const userId: number = socket.request.id;
    const { groupService } = ServicesContext.getInstance();

    socket.leave(groupId);
    await groupService.leaveGroup(userId, groupId);
    console.log("Socket => LeaveGroup | data:", { groupId, userId }, "time:", nowDate());
  } catch (error) {
    console.log("Socket => Leave Group | Error:", error.message);
    io.to(socket.id).emit("error", { code: 500, message: error.message });
  }
};

export const kickMember = async (io, socket, { userId, groupId }, cbFn) => {
  try {
    console.log("Socket => Kick member request | data:", { groupId, userId });
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
    console.log("Socket => KickMember | Kicked:", { userId, groupId }, "time:", nowDate());
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