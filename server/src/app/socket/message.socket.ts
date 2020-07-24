import { ServicesContext } from "@context";
import { User, Ads } from "@models";
import { isVitaePostEnabled } from "@utils";

export const getPrivateMsg = async ({ toUser, userId, start = 1, count = 20 }) => {
  const { userService, chatService } = ServicesContext.getInstance();

  const RowDataPacket1 = await chatService.getPrivateDetail(userId, toUser, start - 1, count);
  const userInfo: User = await userService.getUserInfoById(toUser);
  const messages = JSON.parse(JSON.stringify(RowDataPacket1));
  return {
    messages,
    userInfo,
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
  const { groupChatService, groupService } = ServicesContext.getInstance();

  const RowDataPacket1 = await groupChatService.getGroupMsg(groupId, start - 1, count);
  const RowDataPacket2 = await groupService.getGroupByGroupId(groupId);
  const RowDataPacket3 = await groupChatService.getGroupMember(groupId);
  const members = JSON.parse(JSON.stringify(RowDataPacket3));
  const messages = JSON.parse(JSON.stringify(RowDataPacket1));
  const groupInfo = JSON.parse(JSON.stringify(RowDataPacket2));
  return {
    messages,
    groupInfo: { ...groupInfo, members },
  };
};

export const getAllMessage = async ({ userId, clientHomePageList }) => {
  try {
    const { userService, chatService, groupChatService, adsService } = ServicesContext.getInstance();
    const user: User = await userService.findUserById(userId);
    const res1 = await userService.getPrivateList(userId);
    const privateList = JSON.parse(JSON.stringify(res1));
    const res2 = await userService.getGroupList(userId);
    const groupList = JSON.parse(JSON.stringify(res2));
    const homePageList = groupList.concat(privateList);
    const privateChat = new Map();
    const groupChat = new Map();
    if (homePageList && homePageList.length) {
      for (const item of homePageList) {
        if (clientHomePageList && clientHomePageList.length) {
          const goal = clientHomePageList.find(e =>
            e.userId ? e.userId === item.userId : e.groupId === item.groupId,
          );
          if (goal) {
            const sortTime = goal.time;
            const res = item.userId
              ? await chatService.getUnreadCount({
                sortTime,
                fromUser: userId,
                toUser: item.userId,
              })
              : await groupChatService.getUnreadCount({ sortTime, groupId: item.groupId });
            item.unread = goal.unread + JSON.parse(JSON.stringify(res))[0].unread;
          }
        }
        if (item.userId) {
          const data = await getPrivateMsg({ toUser: item.userId, userId });
          privateChat.set(item.userId, data);
        } else if (item.groupId) {
          const data = await getGroupItem({ groupId: item.groupId });
          groupChat.set(item.groupId, data);
        }
      }
    }

    let adsList = await adsService.findAdsByUserId(userId);
    if (user.role === User.ROLE.MODERATOR || user.role === User.ROLE.OWNER) {
      adsList = adsList.filter(ads => ads.status === Ads.STATUS.Created || ads.status === Ads.STATUS.Rejected);
      const allAds = await adsService.findAllAds();
      adsList.push(...allAds);
    }

    return {
      userInfo: {
        ...user,
        isVitaePostEnabled: isVitaePostEnabled(user)
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
