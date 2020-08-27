import { notification as antNotification } from 'antd';
import { clearUnreadAction } from '../../containers/HomePageList/homePageListAction';
import { addGroupMessagesAction } from '../../containers/GroupChatPage/groupChatAction';
import { addPrivateChatMessagesAction } from '../../containers/PrivateChatPage/privateChatAction';
import { shareAction } from '../../redux/actions/shareAction';
import store from '../../redux/store';
import notification from '../../components/Notification';
import Request from '../../utils/request';

export default class Chat {
  constructor() {
    this._hasLoadAllMessages = false;
  }

  clickItemToShare = ({ homePageList, chatId, userInfo }) => {
    const data = homePageList.filter(e => e.userId === chatId || e.groupId === chatId);
    if (!data) {
      throw Error("can't find the date of this item");
    }
    const { name, avatar, userId, groupId } = userInfo || data[0];
    store.dispatch(
      shareAction({
        name,
        avatar,
        userId,
        groupId,
      }),
    );
  };

  clearUnreadHandle({ homePageList, chatFromId }) {
    store.dispatch(clearUnreadAction({ homePageList, chatFromId }));
  }

  async lazyLoadGroupMessages({ chats, chatId, start, count }) {
    if (!this._hasLoadAllMessages) {
      try {
        const res = await Request.axios('post', '/api/v1/socket/getGroupMessage', {
          groupId: chatId,
          start,
          count,
        });
        if (res && res.success) {
          const groupMessages = res.groupMessages;
          if (groupMessages && groupMessages.length === 0) {
            this._hasLoadAllMessages = true;
            notification('Already in the end', 'warn', 2);
            return;
          }
          store.dispatch(
            addGroupMessagesAction({
              allGroupChats: chats,
              messages: groupMessages,
              groupId: chatId,
              inLazyLoading: true,
            }),
          );
        } else {
          antNotification.error({ message: res.message });
        }
      } catch (error) {
        // console.log(error);
        notification('Something went wrong, please try again later', 'error');
      }
    }
  }

  lazyLoadPrivateChatMessages({ chats, chatId, start, count }) {
    return new Promise(async (resolve, reject) => {
      if (!this._hasLoadAllMessages) {
        const res = await Request.axios('post', '/api/v1/socket/getPrivateMessage', {
          toUser: chatId,
          start,
          count,
        });
        if (res && res.success) {
          const privateMessages = res.privateMessages;
          if (privateMessages && privateMessages.length === 0) {
            this._hasLoadAllMessages = true;
            notification('Already in the end', 'warn', 2);
            reject();
          }
          store.dispatch(
            addPrivateChatMessagesAction({
              allPrivateChats: chats,
              messages: privateMessages,
              chatId,
              inLazyLoading: true,
            }),
          );
          resolve('success!');
        } else {
          antNotification.error({ message: res.message });
        }
      }
    });
  }

  get isScrollInBottom() {
    const ulDom = document.getElementsByClassName('chat-content-list')[0];
    if (ulDom) {
      const { scrollTop, offsetHeight, scrollHeight } = ulDom;
      return scrollTop === scrollHeight - offsetHeight;
    }
    return false;
  }
}
