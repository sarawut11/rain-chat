import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ChatHeader from '../ChatHeader';
import InputArea from '../InputArea';
import ChatContentList from '../ChatContentList';
import PersonalInfo from '../PersonalInfo';
import notification from '../Notification';
import '../../assets/chat.scss';
import ShareModal from '../ShareModal';
import Chat from '../../modules/Chat';
import request from '../../utils/request';
import debounce from '../../utils/debounce';
import Button from '../Button';

export default class PrivateChat extends Component {
  constructor() {
    super();
    this._sendByMe = false;
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this._hasBeenFriend = false;
    this._chat = new Chat();
    this.state = {
      showPersonalInfo: false,
      showShareModal: false,
      toUserInfo: {},
      disableJoinButton: false,
    };
  }

  sendMessage = async (inputMsg = '', attachments = []) => {
    if (inputMsg.trim() === '' && attachments.length === 0) return;
    const { userId } = this._userInfo;
    const {
      allPrivateChats,
      homePageList,
      updateHomePageList,
      addPrivateChatMessages,
    } = this.props;
    const data = {
      toUser: this.friendId, // Other's id
      message: inputMsg === '' ? `[${attachments[0].type || 'file'}]` : `${inputMsg}`, // Message content
      attachments, // attatchment
      // time: Date.parse(new Date()) / 1000 //
    };
    this._sendByMe = true;
    const response = await request.socketEmitAndGetResponse('sendPrivateMsg', data, () => {
      notification('Message failed to send', 'error', 2);
    });
    addPrivateChatMessages({
      allPrivateChats,
      message: response,
      chatId: this.friendId,
    });
    // eslint-disable-next-line no-restricted-globals
    const dataForHomePage = { ...response, name: location.search.split('=')[1] };
    updateHomePageList({ data: dataForHomePage, homePageList, myUserId: userId });
  };

  addAsTheContact = async () => {
    if (this.state.disableJoinButton) return;
    this.setState({ disableJoinButton: true });
    const { allPrivateChats, homePageList, updateHomePageList, addPrivateChatInfo } = this.props;
    if (this.chatId === this._userInfo.userId) {
      notification('Can not add yourself as a contact', 'error', 2);
      return;
    }
    const data = await request.socketEmitAndGetResponse(
      'addAsTheContact',
      { fromUser: this.friendId },
      () => {
        notification('Add failed! ', 'error', 1.5);
        this.setState({ disableJoinButton: false });
      },
    );
    addPrivateChatInfo({ allPrivateChats, chatId: this.friendId, userInfo: data });
    const dataInHomePageList = {
      ...data,
      toUser: data.userId,
      message: 'Add contact successfully, send me a message:)',
      time: Date.parse(new Date()) / 1000,
    };
    updateHomePageList({ data: dataInHomePageList, homePageList });
  };

  _showPersonalInfo(value) {
    this.setState({ showPersonalInfo: value });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { relatedCurrentChat, match } = nextProps;
    // // console.log('shouldComponentUpdate', relatedCurrentChat, chatId, this.props.chatId, this._sendByMe);
    if (relatedCurrentChat || match.params.userId !== this.chatId || this._sendByMe) {
      this._sendByMe = false;
      return true;
    }

    const { showPersonalInfo } = nextState;
    if (showPersonalInfo !== this.state.showPersonalInfo) return true;

    return false;
  }

  _showShareModal = () => {
    this.setState(state => ({ showShareModal: !state.showShareModal }));
  };

  _deletePrivateChat = () => {
    const { deletePrivateChat, allPrivateChats } = this.props;
    deletePrivateChat({ allPrivateChats, chatId: this.chatId });
  };

  _deleteHomePageList = () => {
    const { deleteHomePageList, homePageList } = this.props;
    deleteHomePageList({ homePageList, chatId: this.chatId });
  };

  async componentDidMount() {
    const { allPrivateChats } = this.props;
    const chatItem = allPrivateChats && allPrivateChats.get(this.chatId);
    if (!chatItem) {
      const res = await request.axios('post', '/api/v1/socket/getUserInfo', {
        userId: this.chatId,
      });
      if (res && res.success) {
        const toUserInfo = res.userInfo;
        this.setState({ toUserInfo });
      }
    }
  }

  render() {
    const {
      allPrivateChats,
      shareData,
      homePageList,
      allGroupChats,
      deleteHomePageList,
      deletePrivateChat,
      initApp,
    } = this.props;
    const { showPersonalInfo, showShareModal, toUserInfo, disableJoinButton } = this.state;
    if ((!allPrivateChats && !allPrivateChats.size) || !this.chatId) return null;
    const chatItem = allPrivateChats.get(this.chatId);
    const messages = chatItem ? chatItem.messages : [];
    const userInfo = chatItem ? chatItem.userInfo : toUserInfo;
    return (
      <div className="chat-wrapper">
        <ShareModal
          title="Share this contact to"
          modalVisible={showShareModal}
          chatId={this.chatId}
          showShareModal={this._showShareModal}
          cancel={this._showShareModal}
          allGroupChats={allGroupChats}
          homePageList={homePageList}
        />
        <ChatHeader
          showPersonalInfo={() => this._showPersonalInfo(true)}
          title={(userInfo && userInfo.name) || '----'}
          showShareModal={this._showShareModal}
          chatType="private"
          showShareIcon={!!chatItem}
        />
        <ChatContentList
          chat={this._chat}
          chats={allPrivateChats}
          ChatContent={messages}
          chatId={this.chatId}
          chatType="privateChat"
          clickAvatar={() => this._showPersonalInfo(true)}
        />
        <PersonalInfo
          userInfo={userInfo}
          hide={() => this._showPersonalInfo(false)}
          modalVisible={showPersonalInfo}
          homePageList={homePageList}
          allPrivateChats={allPrivateChats}
          deleteHomePageList={deleteHomePageList}
          deletePrivateChat={deletePrivateChat}
        />
        {chatItem ? (
          <InputArea shareData={shareData} sendMessage={this.sendMessage} />
        ) : (
          initApp && (
            <Button
              clickFn={debounce(this.addAsTheContact, 2000, true)}
              value="Add as contact"
              disable={disableJoinButton}
              className="button"
            />
          )
        )}
      </div>
    );
  }

  get chatId() {
    return parseInt(this.props.match.params.userId, 10);
  }

  // question: writing as this is ok ?
  get friendId() {
    return parseInt(this.props.location.pathname.split('private_chat/')[1], 10);
  }
}

PrivateChat.propTypes = {
  allPrivateChats: PropTypes.instanceOf(Map),
  allGroupChats: PropTypes.instanceOf(Map),
  homePageList: PropTypes.array,
  updateHomePageList: PropTypes.func,
  addPrivateChatMessages: PropTypes.func,
  addPrivateChatInfo: PropTypes.func,
  shareData: PropTypes.object,
  deleteHomePageList: PropTypes.func,
  deletePrivateChat: PropTypes.func,
  initApp: PropTypes.bool,
};

PrivateChat.defaultProps = {
  allPrivateChats: new Map(),
  allGroupChats: new Map(),
  homePageList: [],
  updateHomePageList: undefined,
  addPrivateChatMessages: undefined,
  addPrivateChatInfo: undefined,
  shareData: undefined,
  deleteHomePageList() {},
  deletePrivateChat() {},
  initApp: false,
};
