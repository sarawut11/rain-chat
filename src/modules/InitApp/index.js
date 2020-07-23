import io from 'socket.io-client';
import { notification as antNotification } from 'antd';
import store from '../../redux/store';
import {
  updateHomePageListAction,
  relatedCurrentChatAction,
  setHomePageListAction,
  deleteHomePageListAction,
} from '../../containers/HomePageList/homePageListAction';
import {
  addGroupMessagesAction,
  addGroupMessageAndInfoAction,
  setAllGroupChatsAction,
  deleteGroupChatAction,
} from '../../containers/GroupChatPage/groupChatAction';
import { setAdsAction, updateAdsStatus, updateAdsInfo } from '../../containers/AdsPage/adsAction';
import { setUserInfoAction, setBalanceAction } from '../../redux/actions/userAction';
import { setStaticAdsAction } from '../../redux/actions/staticAdsAction';
import { enableVitaePost, disableVitaePost } from '../../redux/actions/enableVitaePost';
import {
  addPrivateChatMessagesAction,
  addPrivateChatMessageAndInfoAction,
  setAllPrivateChatsAction,
  deletePrivateChatAction,
} from '../../containers/PrivateChatPage/privateChatAction';
import BrowserNotification from '../BrowserNotification';
import Chat from '../Chat';
import { showAds, notifyRainComing, notifyRainReward } from '../../utils/ads';
import request from '../../utils/request';

class InitApp {
  constructor(props) {
    this.WEBSITE_ADDRESS =
      process.env.NODE_ENV === 'production' ? 'https://production_link' : request.apiUrl;
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this._hasCalledMe = false;
    this._browserNotification = new BrowserNotification();
    this._chat = new Chat();
    this._history = props.history;
    this.initialized = false;
  }

  _browserNotificationHandle = data => {
    const { homePageListState } = store.getState();
    const { name, message, avatar } = data;
    const chatType = data.groupId ? 'group_chat' : 'private_chat';
    const chatFromId = data.groupId ? data.groupId : data.fromUser;
    const title = data.groupId && data.groupName ? data.groupName : name;
    const audio = 'https://cdn.aermin.top/audio.aac';
    this._browserNotification.notify({
      title,
      text: message,
      icon: avatar,
      audio,
      onClick: () => {
        this._history.push(`/${chatType}/${chatFromId}`);
        window.focus();
        this._chat.clearUnreadHandle({
          homePageList: homePageListState,
          chatFromId,
        });
      },
    });
  };

  _listeningPrivateChatMsg() {
    window.socket.on('getPrivateMsg', data => {
      console.log('\ngetPrivateMsg:\n', data);
      const { homePageListState, allPrivateChatsState } = store.getState();
      // eslint-disable-next-line radix
      const chatId = parseInt(window.location.pathname.split('/').slice(-1)[0]);
      const isRelatedCurrentChat = data.fromUser === chatId || data.toUser === chatId;
      const increaseUnread = isRelatedCurrentChat ? 0 : 1;
      store.dispatch(relatedCurrentChatAction(isRelatedCurrentChat));
      if (
        !allPrivateChatsState.get(data.fromUser) ||
        !allPrivateChatsState.get(data.fromUser).userInfo
      ) {
        const userInfo = {
          ...data,
          userId: data.fromUser,
        };
        store.dispatch(
          addPrivateChatMessageAndInfoAction({
            allPrivateChats: allPrivateChatsState,
            message: data,
            chatId: data.fromUser,
            userInfo,
          }),
        );
      } else {
        store.dispatch(
          addPrivateChatMessagesAction({
            allPrivateChats: allPrivateChatsState,
            message: data,
            chatId: data.fromUser,
          }),
        );
      }
      store.dispatch(
        updateHomePageListAction({
          data,
          homePageList: homePageListState,
          myUserId: this.userId,
          increaseUnread,
        }),
      );
      this._browserNotificationHandle(data);
      // TODO: mute notifications switch
    });
  }

  _listeningGroupChatMsg() {
    window.socket.on('getGroupMsg', data => {
      const { allGroupChatsState, homePageListState } = store.getState();
      // eslint-disable-next-line radix
      const chatId = window.location.pathname.split('/').slice(-1)[0];
      const isRelatedCurrentChat = data.groupId === chatId;
      store.dispatch(relatedCurrentChatAction(isRelatedCurrentChat));
      if (data.tip === 'joinGroup') {
        store.dispatch(
          addGroupMessageAndInfoAction({
            allGroupChats: allGroupChatsState,
            groupId: data.groupId,
            message: data,
            member: data,
          }),
        );
      } else {
        store.dispatch(
          addGroupMessagesAction({
            allGroupChats: allGroupChatsState,
            message: data,
            groupId: data.groupId,
          }),
        );
      }
      if (data.message && !this._hasCalledMe) {
        const regexp = new RegExp(`@${this._userInfo.name}\\s\\S*|@${this._userInfo.name}$`);
        this._hasCalledMe = regexp.test(data.message);
      }
      store.dispatch(
        updateHomePageListAction({
          data,
          homePageList: homePageListState,
          increaseUnread: isRelatedCurrentChat ? 0 : 1,
          showCallMeTip: this._hasCalledMe,
        }),
      );
      this._browserNotificationHandle(data);
      // TODO: mute notifications switch
    });
    window.socket.on('kickedFromGroup', data => {
      const { groupId } = data;
      const myInfo = JSON.parse(localStorage.getItem('userInfo'));
      const { userId } = myInfo;
      window.socket.emit('leaveGroup', { userId, groupId });
      const homePageList = store.getState().homePageListState;
      const allGroupChats = store.getState().allGroupChatsState;
      store.dispatch(deleteHomePageListAction({ homePageList, chatId: groupId }));
      store.dispatch(deleteGroupChatAction({ allGroupChats, chatId: groupId }));
      window.location.href = '/group_chat/vitae-rain-group';
      console.log(`You are kicked from Group:${groupId}`);
    });
  }

  _listeningBeDelete() {
    window.socket.on('beDeleted', fromUser => {
      const homePageList = store.getState().homePageListState;
      const allPrivateChats = store.getState().allPrivateChats;
      store.dispatch(deleteHomePageListAction({ homePageList, chatId: fromUser }));
      store.dispatch(deletePrivateChatAction({ allPrivateChats, chatId: fromUser }));
    });
  }

  _listeningInitMessage() {
    window.socket.on('initSocketSuccess', allMessage => {
      const privateChat = new Map(allMessage.privateChat);
      const groupChat = new Map(allMessage.groupChat);
      const { adsList } = allMessage;
      store.dispatch(setHomePageListAction(allMessage.homePageList));
      store.dispatch(setAllPrivateChatsAction({ data: privateChat }));
      store.dispatch(setAllGroupChatsAction({ data: groupChat }));

      try {
        const { isVitaePostEnabled } = allMessage.userInfo;
        if (isVitaePostEnabled) {
          store.dispatch(enableVitaePost());
        } else {
          store.dispatch(disableVitaePost());
        }
      } catch (e) {
        console.log(e);
      }

      if (allMessage.userInfo.role !== 'MODERATOR') store.dispatch(setAdsAction({ data: adsList }));
      console.log('initMessage success. ', 'time=>', new Date().toLocaleString(), allMessage);

      store.dispatch(setUserInfoAction({ data: allMessage.userInfo }));
    });
    window.socket.on('initSocket', (socketId, fn) => {
      const clientHomePageList = JSON.parse(localStorage.getItem(`homePageList-${this.userId}`));
      fn(this.userId, clientHomePageList);
    });
  }

  _listeningRain() {
    window.socket.on('rainComing', ({ after }) => {
      console.log(`Rain is coming after ${after}seconds`);
      notifyRainComing(after);
    });
    window.socket.on('showAds', ({ ads, duration }) => {
      console.log('Show Ads', ads, '| Duration -', duration);
      showAds(ads, duration);
    });
    window.socket.on('getRain', ({ reward, balance }) => {
      console.log('Getting Reward:', reward);
      console.log('Balance Updated :', balance);
      notifyRainReward(reward);
      store.dispatch(setBalanceAction(balance));
    });
    window.socket.on('updateAdsStatus', ({ ads }) => {
      console.log('Ads Status Updated:', ads);
      store.dispatch(updateAdsInfo(ads));
    });
    window.socket.on('updateAdsImpressions', ({ adsInfo }) => {
      console.log('Impression Updated:', adsInfo.impressions);
    });
    window.socket.on('enableVitaePost', () => {
      console.log('Able to post to Vitae Rain Room');
      store.dispatch(enableVitaePost());
    });
    window.socket.on('showStaticAds', ({ ads }) => {
      console.log('Static Ads:', ads);
      store.dispatch(setStaticAdsAction(ads));
    });
  }

  _listeningTransaction() {
    window.socket.on('transactionExpired', ({ type, expectAmount, time }) => {
      console.log('Transaction Request Expired', type, expectAmount, time);
    });
  }

  _listenUserInfo() {
    window.socket.on('updateBalance', ({ balance }) => {
      console.log('Balance Updated:', balance);
      store.dispatch(setBalanceAction(balance));
    });
    window.socket.on('updateProfileInfo', ({ username, avatarUrl, name, intro }) => {
      console.log(`${username}'s profile updated:`, avatarUrl, name, intro);
    });
  }

  _listenExpense() {
    window.socket.on('expenseCreated', ({ creatorUsername, amount }) => {
      console.log(`${creatorUsername} created financial expense request of ${amount} vitae.`);
    });
    window.socket.on('expenseConfirmed', ({ creatorUsername, confirmerUsername }) => {
      console.log(`${confirmerUsername} confirmed ${creatorUsername}'s financial expense request.`);
    });
    window.socket.on('expenseRejected', ({ creatorUsername, rejectorUsername }) => {
      console.log(`${rejectorUsername} rejected ${creatorUsername}'s financial expense request.`);
    });
  }

  subscribeSocket() {
    window.socket.removeAllListeners();
    this._listeningInitMessage();
    this._listeningPrivateChatMsg();
    this._listeningGroupChatMsg();
    this._listeningBeDelete();
    this._listeningRain();
    this._listeningTransaction();
    this._listenExpense();
    this._listenUserInfo();
    console.log('subscribeSocket success. ', 'time=>', new Date().toLocaleString());
  }

  _connectSocket() {
    window.socket = io(`${this.WEBSITE_ADDRESS}?token=${this._userInfo.token}`);
    this.sendRegularSocket();
  }

  // Send regular socket every 15mins to avoid disconnection from idle status
  sendRegularSocket() {
    setTimeout(() => {
      if (window.socket) {
        window.socket.emit('regular ping');
      }
      this.sendRegularSocket();
    }, 15 * 60 * 1000);
  }

  _init = async () => {
    this._connectSocket();
    this.subscribeSocket();
    console.log('init app success. ', 'time=>', new Date().toLocaleString());
  };

  init = async () => {
    if (this._userInfo && !this.initialized) {
      await this._init();
      this.initialized = true;
      console.log('initialized');
      let afterReconnecting = false;
      window.socket.on('error', error => {
        console.log('window.socket on error', error);
        // notification(error, 'error');
        antNotification.error({ message: error });
        // if (error.code === 401) {
        //   window.location.href = '/login';
        // }
        window.socket.disconnect();
        localStorage.removeItem('userInfo');
        this._history.push('/login');
      });
      window.socket.on('reconnect', attemptNumber => {
        if (!afterReconnecting) {
          window.socket.disconnect();
          this._init();
          afterReconnecting = true;
          console.log('not reconnecting, open automatically time=>', new Date().toLocaleString());
        }
        console.log(
          'reconnect successfully. attemptNumber =>',
          attemptNumber,
          'socket-id => ',
          window.socket.id,
          'time=>',
          new Date().toLocaleString(),
        );
      });
      window.socket.on('reconnecting', attemptNumber => {
        afterReconnecting = true;
        console.log(
          'reconnecting. attemptNumber =>',
          attemptNumber,
          'time=>',
          new Date().toLocaleString(),
        );
      });
      window.socket.on('disconnect', async reason => {
        afterReconnecting = false;
        console.log(
          'disconnect in client, disconnect reason =>',
          reason,
          'time=>',
          new Date().toLocaleString(),
        );
      });
      window.socket.on('reconnect_error', error => {
        afterReconnecting = false;
        console.log('reconnect_error. error =>', error, 'time=>', new Date().toLocaleString());
        // notification(error, 'error');
        antNotification.error({ message: 'Internal server error' });

        window.socket.disconnect();
        localStorage.removeItem('userInfo');
        this._history.push('/login');
      });
    }
  };

  get userId() {
    return (this._userInfo && this._userInfo.userId) || null;
  }
}

export default InitApp;
