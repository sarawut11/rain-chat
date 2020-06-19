import { ServicesContext } from "../context";
import { User } from "../models";
import { isVitaePostEnabled } from "../utils/utils";

export const getPrivateMsg = async ({ toUser, userId, start = 1, count = 20 }) => {
  const { userService, chatService } = ServicesContext.getInstance();

  const RowDataPacket1 = await chatService.getPrivateDetail(userId, toUser, start - 1, count);
  const RowDataPacket2 = await userService.getUserInfoById(toUser);
  const messages = JSON.parse(JSON.stringify(RowDataPacket1));
  const userInfo = JSON.parse(JSON.stringify(RowDataPacket2));
  return {
    messages,
    userInfo: userInfo[0],
  };
};

export const getGroupItem = async ({
  groupId,
  start = 1,
  count = 20,
}: {
  groupId: string;
  start?: number;
  count?: number;
}) => {
  const { groupChatService } = ServicesContext.getInstance();

  const RowDataPacket1 = await groupChatService.getGroupMsg(groupId, start - 1, count);
  const RowDataPacket2 = await groupChatService.getGroupInfo([groupId, undefined]);
  const RowDataPacket3 = await groupChatService.getGroupMember(groupId);
  const members = JSON.parse(JSON.stringify(RowDataPacket3));
  const messages = JSON.parse(JSON.stringify(RowDataPacket1));
  const groupInfo = JSON.parse(JSON.stringify(RowDataPacket2))[0];
  return {
    messages,
    groupInfo: { ...groupInfo, members },
  };
};

export const getAllMessage = async ({ userId, clientHomePageList }) => {
  try {
    const { userService, chatService, groupChatService, adsService } = ServicesContext.getInstance();
    const user: User[] = await userService.findUserById(userId);
    const res1 = await userService.getPrivateList(userId);
    const privateList = JSON.parse(JSON.stringify(res1));
    const res2 = await userService.getGroupList(userId);
    const groupList = JSON.parse(JSON.stringify(res2));
    const homePageList = groupList.concat(privateList);
    const res3 = await adsService.findAdsByUserId(userId);
    const adsList = JSON.parse(JSON.stringify(res3));
    const privateChat = new Map();
    const groupChat = new Map();
    if (homePageList && homePageList.length) {
      for (const item of homePageList) {
        if (clientHomePageList && clientHomePageList.length) {
          const goal = clientHomePageList.find(e =>
            e.user_id ? e.user_id === item.user_id : e.to_group_id === item.to_group_id,
          );
          if (goal) {
            const sortTime = goal.time;
            const res = item.user_id
              ? await chatService.getUnreadCount({
                sortTime,
                from_user: userId,
                to_user: item.user_id,
              })
              : await groupChatService.getUnreadCount({ sortTime, to_group_id: item.to_group_id });
            item.unread = goal.unread + JSON.parse(JSON.stringify(res))[0].unread;
          }
        }
        if (item.user_id) {
          const data = await getPrivateMsg({ toUser: item.user_id, userId });
          privateChat.set(item.user_id, data);
        } else if (item.to_group_id) {
          const data = await getGroupItem({ groupId: item.to_group_id });
          groupChat.set(item.to_group_id, data);
        }
      }
    }

    return {
      userInfo: {
        ...user[0],
        isVitaePostEnabled: isVitaePostEnabled(user[0])
      },
      homePageList,
      privateChat: Array.from(privateChat),
      groupChat: Array.from(groupChat),
      adsList
    };
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
