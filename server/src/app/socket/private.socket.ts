import { User, PrivateMessage } from "@models";
import { ServicesContext } from "@context";
import { now, nowDate } from "@utils";

export const sendPrivateMsg = async ({ userId, toUser, message, attachments }, cbFn) => {
  try {
    const { chatService, userService } = ServicesContext.getInstance();

    const isFriend: boolean = await userService.isFriend(userId, toUser);
    if (!isFriend) return;
    if (!message) return;
    const fromUser: User = await userService.findUserById(userId);
    const msgData = {
      fromUser: userId,
      avatar: fromUser.avatar,
      toUser,
      message,
      time: now(),
      attachments: JSON.stringify(attachments),
    };
    await chatService.savePrivateMsg(msgData);

    console.log("Socket => SendPrivateMsg | data:", msgData, "time:", nowDate());
    cbFn(toUser, msgData);
  } catch (error) {
    console.log("Socket => SendPrivateMsg | Error:", error.message);
  }
};

export const getOnePrivateChatMessages = async (data, cbFn) => {
  try {
    const userId = data.userId;
    const { chatService } = ServicesContext.getInstance();
    const { toUser, start, count } = data;

    const RowDataPacket = await chatService.getPrivateDetail(userId, toUser, start - 1, count);
    const privateMessages = JSON.parse(JSON.stringify(RowDataPacket));
    console.log("Socket => GetOnePrivateChatMessages | data:", data, "time:", nowDate());
    cbFn(privateMessages);
  } catch (error) {
    console.log("Socket => GetOnePrivateChatMessages | Error:", error.message);
  }
};

export const addAsTheContact = async ({ userId, fromUser }, cbFn) => {
  try {
    const { userService } = ServicesContext.getInstance();

    const userInfo: User = await userService.getUserInfoById(fromUser);
    const isFriend = await userService.isFriend(userId, fromUser);
    if (!isFriend) {
      await userService.addFriendEachOther(userId, fromUser, now());
      console.log("Socket => AddAsTheContact | data:", { userId, fromUser }, "time:", nowDate());
    }
    cbFn(userInfo);
  } catch (error) {
    console.log("Socket => AddAsTheContact | Error:", error.message);
  }
};

export const getUserInfo = async (userId, cbFn) => {
  try {
    const { userService } = ServicesContext.getInstance();
    const userInfo: User = await userService.getUserInfoById(userId);
    console.log("Socket => GetUserInfo | userId:", userId, "time:", nowDate());
    cbFn(userInfo);
  } catch (error) {
    console.log("Socket => GetUserInfo | Error:", error.message);
  }
};

export const deleteContact = async ({ userId, toUser }, cbFn) => {
  try {
    const { userService } = ServicesContext.getInstance();
    await userService.deleteContact(userId, toUser);
    console.log(`Socket => DeleteContact | userId:${userId}, toUser:${toUser}, time:${nowDate()}`);
    cbFn(toUser, userId, { code: 200, data: "delete contact successfully" });
  } catch (error) {
    console.log("Socket => Delete Contact | Error:", error.message);
  }
};