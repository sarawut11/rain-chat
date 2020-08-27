import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import ChatHeader from '../ChatHeader';
import InputArea from '../InputArea';
import ChatContentList from '../ChatContentList';
import GroupChatInfo from '../GroupChatInfo';
// import Modal from '../Modal';
import ShareModal from '../ShareModal';
import PersonalInfo from '../PersonalInfo';
import notification from '../Notification';
import Chat from '../../modules/Chat';
import Button from '../Button';
import request from '../../utils/request';
import './styles.scss';
import debounce from '../../utils/debounce';
import { setUserInfoAction } from '../../redux/actions/userAction';

class GroupChat extends Component {
  constructor(props) {
    super(props);
    this._sendByMe = false;
    this.state = {
      groupMsgAndInfo: {},
      showGroupChatInfo: false,
      showPersonalInfo: false,
      personalInfo: {},
      showShareModal: false,
      disableJoinButton: false,
    };
    this._chat = new Chat();
  }

  sendMessage = async (inputMsg = '', attachments = []) => {
    if (inputMsg.trim() === '' && attachments.length === 0) return;
    const { id, avatar, name } = this.props.userInfo;
    const userId = id;
    const { allGroupChats, homePageList, updateHomePageList, addGroupMessages } = this.props;
    const data = {
      fromUser: userId, // Own id
      avatar, // Own avatar
      name,
      groupName: this.groupName,
      message: inputMsg === '' ? `[${attachments[0].type || 'file'}]` : `${inputMsg}`, // Message content
      attachments, // attatchment
      groupId: this.chatId,
      // time: Date.parse(new Date()) / 1000 // time
    };
    this._sendByMe = true;

    const response = await request.socketEmitAndGetResponse('sendGroupMsg', data, () => {
      notification('Failed to send message', 'error', 2);
    });
    addGroupMessages({ allGroupChats, message: response, groupId: this.chatId });
    updateHomePageList({ data: response, homePageList, myUserId: userId });
  };

  joinGroup = async () => {
    try {
      if (this.state.disableJoinButton) return;
      this.setState({ disableJoinButton: true });
      const {
        allGroupChats,
        homePageList,
        updateHomePageList,
        addGroupMessageAndInfo,
      } = this.props;
      // console.log('\n\n---   joinGroup function   ---\n\n', this);
      await request.socketEmit('joinGroup', { groupId: this.chatId }, () => {
        notification('Add group failed', 'error', 1.5);
        this.setState({ disableJoinButton: false });
      });
      const res = await request.axios('post', '/api/v1/socket/getGroupItem', {
        groupId: this.chatId,
        start: 1,
      });
      if (res && res.success) {
        const { messages, groupInfo } = res.groupMsgAndInfo;
        const lastContent = {
          name: 'Group assistant',
          message: 'You have successfully added a group, you can start chatting~',
          time: Date.parse(new Date()) / 1000,
        };
        messages.push(lastContent);
        addGroupMessageAndInfo({
          allGroupChats,
          messages,
          groupId: this.chatId,
          groupInfo,
        });
        updateHomePageList({ data: { ...lastContent, ...groupInfo }, homePageList });
      }
    } catch (e) {
      // console.log(e);
    }
  };

  _showLeaveModal = () => {
    Modal.confirm({
      title: 'Are you sure you want to leave this group?',
      onOk: this.leaveGroup,
    });
  };

  leaveGroup = () => {
    const userId = this.props.userInfo.id;
    const { homePageList, deleteHomePageList, allGroupChats, deleteGroupChat } = this.props;
    window.socket.emit('leaveGroup', { userId, groupId: this.chatId });
    deleteHomePageList({ homePageList, chatId: this.chatId });
    deleteGroupChat({ allGroupChats, groupId: this.chatId });
    this.props.history.push('/');
  };

  _showGroupChatInfo(value) {
    this.setState({ showGroupChatInfo: value });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { relatedCurrentChat, match } = nextProps;
    if (relatedCurrentChat || match.params.groupId !== this.chatId || this._sendByMe) {
      this._sendByMe = false;
      return true;
    }

    const { showGroupChatInfo, showPersonalInfo } = nextState;
    if (
      showGroupChatInfo !== this.state.showGroupChatInfo ||
      showPersonalInfo !== this.state.showPersonalInfo
    )
      return true;

    return false;
  }

  _showPersonalInfo(value) {
    this.setState({ showPersonalInfo: value });
  }

  _clickPersonAvatar = userId => {
    const { allGroupChats } = this.props;
    const { members = [] } =
      (allGroupChats.get(this.chatId) && allGroupChats.get(this.chatId).groupInfo) || {};
    const personalInfo = members.filter(member => member.userId === userId)[0];
    if (!members.length || !userId) return;
    if (!personalInfo) {
      notification('This person is no longer in the group', 'warn', 1.5);
      return;
    }
    this.setState({ personalInfo }, () => {
      this._showPersonalInfo(true);
    });
  };

  async componentDidMount() {
    const { allGroupChats } = this.props;
    const chatItem = allGroupChats && allGroupChats.get(this.chatId);
    // (Product Design) When searching for groups that have not been added, click to go to the group content, request the group content, and avoid adding groups if you do n’t understand.
    if (!chatItem) {
      const res = await request.axios('post', '/api/v1/socket/getGroupItem', {
        groupId: this.chatId,
        start: 1,
      });
      if (res && res.success) {
        const groupMsgAndInfo = res.groupMsgAndInfo;
        this.setState({ groupMsgAndInfo });
      }
    }
  }

  get chatId() {
    // eslint-disable-next-line react/prop-types
    return this.props.match.params.groupId;
  }

  _showShareModal = () => {
    this.setState(state => ({ showShareModal: !state.showShareModal }));
  };

  render() {
    const {
      allGroupChats,
      updateGroupTitleNotice,
      updateListGroupName,
      homePageList,
      shareData,
      deleteHomePageList,
      allPrivateChats,
      deletePrivateChat,
      initApp,
      deleteGroupMember,
    } = this.props;
    const {
      groupMsgAndInfo,
      showGroupChatInfo,
      personalInfo,
      showPersonalInfo,
      showShareModal,
      disableJoinButton,
    } = this.state;
    if ((!allGroupChats && !allGroupChats.size) || !this.chatId) return null;
    const chatItem = allGroupChats.get(this.chatId);
    const messages = chatItem ? chatItem.messages : groupMsgAndInfo.messages;
    const groupInfo = chatItem ? chatItem.groupInfo : groupMsgAndInfo.groupInfo;

    return (
      <div className="chat-wrapper">
        <ChatHeader
          title={(groupInfo && groupInfo.name) || '----'}
          groupId={groupInfo && groupInfo.groupId}
          chatType="group"
          hasShowed={showGroupChatInfo}
          showShareModal={this._showShareModal}
          showGroupChatInfo={value => this._showGroupChatInfo(value)}
          showShareIcon={!!chatItem}
        />
        <ShareModal
          title="Share this group to"
          modalVisible={showShareModal}
          chatId={this.chatId}
          showShareModal={this._showShareModal}
          cancel={this._showShareModal}
          allGroupChats={allGroupChats}
          homePageList={homePageList}
        />
        <PersonalInfo
          groupInfo={groupInfo}
          userInfo={personalInfo}
          hide={() => this._showPersonalInfo(false)}
          homePageList={homePageList}
          allPrivateChats={allPrivateChats}
          allGroupChats={allGroupChats}
          deleteHomePageList={deleteHomePageList}
          deletePrivateChat={deletePrivateChat}
          deleteGroupMember={deleteGroupMember}
          modalVisible={chatItem && showPersonalInfo}
        />
        <ChatContentList
          chat={this._chat}
          chats={allGroupChats}
          ChatContent={messages}
          shouldScrollToFetchData={!!chatItem}
          chatId={this.chatId}
          chatType="groupChat"
          clickAvatar={userId => this._clickPersonAvatar(userId)}
        />
        {showGroupChatInfo && (
          <div onClick={() => this._showGroupChatInfo(false)} className="groupChatInfoMask" />
        )}
        {showGroupChatInfo && (
          <GroupChatInfo
            groupInfo={groupInfo}
            allGroupChats={allGroupChats}
            homePageList={homePageList}
            leaveGroup={this._showLeaveModal}
            clickMember={userId => this._clickPersonAvatar(userId)}
            updateGroupTitleNotice={updateGroupTitleNotice}
            updateListGroupName={updateListGroupName}
            chatId={this.chatId}
          />
        )}
        {chatItem ? (
          <InputArea
            shareData={shareData}
            sendMessage={this.sendMessage}
            groupMembers={groupInfo.members}
          />
        ) : (
          initApp && (
            <Button
              clickFn={debounce(this.joinGroup, 2000, true)}
              value="Join group chat"
              disable={disableJoinButton}
              className="button"
            />
          )
        )}
      </div>
    );
  }
}

GroupChat.propTypes = {
  allGroupChats: PropTypes.instanceOf(Map),
  allPrivateChats: PropTypes.instanceOf(Map),
  homePageList: PropTypes.array,
  updateHomePageList: PropTypes.func,
  addGroupMessages: PropTypes.func,
  addGroupMessageAndInfo: PropTypes.func,
  deleteHomePageList: PropTypes.func,
  deleteGroupChat: PropTypes.func,
  deleteGroupMember: PropTypes.func,
  updateGroupTitleNotice: PropTypes.func,
  updateListGroupName: PropTypes.func,
  shareData: PropTypes.object,
  deletePrivateChat: PropTypes.func,
  initApp: PropTypes.bool,
};

GroupChat.defaultProps = {
  allGroupChats: new Map(),
  allPrivateChats: new Map(),
  homePageList: [],
  updateHomePageList() {},
  addGroupMessages() {},
  addGroupMessageAndInfo() {},
  deleteHomePageList() {},
  deleteGroupChat() {},
  deleteGroupMember() {},
  updateGroupTitleNotice() {},
  updateListGroupName() {},
  shareData: undefined,
  deletePrivateChat() {},
  initApp: false,
};

const mapStateToProps = state => ({
  userInfo: state.user.userInfo,
});

const mapDispatchToProps = dispatch => ({
  setUserInfo(arg) {
    dispatch(setUserInfoAction(arg));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GroupChat));
