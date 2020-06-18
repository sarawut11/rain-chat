import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserAdapter from '../UserAvatar';
import './styles.scss';
import CreateGroupModal from '../CreateGroupModal';
import notification from '../Notification';

export default class GroupChatInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupMember: [],
      onlineNumber: '--',
      modalVisible: false,
      justShowOnlineMember: true,
    };
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
    this._isCreator = this._userInfo.user_id === parseInt(props.groupInfo.creator_id, 10);
  }

  componentDidMount() {
    const groupId = this.props.chatId;
    window.socket.emit('getGroupMember', groupId, data => {
      data.sort((a, b) => b.status - a.status);
      const onlineMember = data.filter(e => e.status === 1);
      this.setState({
        groupMember: data,
        onlineNumber: onlineMember.length,
      });
    });
  }

  _clickMember = user_id => {
    this.props.clickMember(user_id);
  };

  _openEditorInfoModal = () => {
    this.setState({ modalVisible: true });
  };

  GroupMemberRender = groupMember => (
    <ul className="members">
      {groupMember.length > 0 &&
        groupMember.map(
          e =>
            (!this.state.justShowOnlineMember || !!e.status) && (
              <li key={e.user_id} className="member" onClick={() => this._clickMember(e.user_id)}>
                <UserAdapter
                  src={e.avatar}
                  name={e.name}
                  isGray={!e.status}
                  showLogo={!!e.github_id}
                />
                <span className="memberName">{e.name}</span>
              </li>
            ),
        )}
    </ul>
  );

  _confirm = ({ groupName, groupNotice }) => {
    this._closeModal();
    this._updateGroupInfo({ groupName, groupNotice });
  };

  _closeModal = () => {
    this.setState({
      modalVisible: false,
    });
  };

  _updateGroupInfo = ({ groupName, groupNotice }) => {
    const {
      groupInfo,
      allGroupChats,
      updateGroupTitleNotice,
      updateListGroupName,
      homePageList,
    } = this.props;
    const { to_group_id } = groupInfo;
    const data = {
      name: groupName,
      group_notice: groupNotice,
      to_group_id,
    };
    window.socket.emit('updateGroupInfo', data, res => {
      updateGroupTitleNotice({
        allGroupChats,
        groupNotice,
        groupName,
        groupId: to_group_id,
      });
      updateListGroupName({
        homePageList,
        name: groupName,
        to_group_id,
      });
      notification(res, 'success');
      this._closeModal();
    });
  };

  _showAllMember = () => {
    this.setState(({ justShowOnlineMember }) => ({
      justShowOnlineMember: !justShowOnlineMember,
    }));
  };

  render() {
    const { groupMember, onlineNumber, modalVisible, justShowOnlineMember } = this.state;
    const { groupInfo, leaveGroup } = this.props;
    const { role } = this.userInfo;

    return (
      <div className="chatInformation">
        <CreateGroupModal
          title="Modify group information"
          modalVisible={modalVisible}
          confirm={args => this._confirm(args)}
          cancel={this._closeModal}
          defaultGroupName={groupInfo.name}
          defaultGroupNotice={groupInfo.group_notice}
        />
        <div className="info">
          <p className="noticeTitle">
            Group announcement
            {(this._isCreator || role === 'OWNER' || role === 'MODERATOR') && (
              <svg
                onClick={this._openEditorInfoModal}
                className="icon iconEditor"
                aria-hidden="true"
              >
                <use xlinkHref="#icon-editor" />
              </svg>
            )}
          </p>
          <p className="noticeContent">{groupInfo.group_notice}</p>
          <p className="memberTitle">
            {`online users: ${onlineNumber}`}
            <span className="showAllMember" onClick={this._showAllMember}>
              {`${justShowOnlineMember ? 'view all' : 'Just watch online'}`}
            </span>
          </p>
        </div>
        {this.GroupMemberRender(groupMember)}
        <p className="leave" onClick={leaveGroup}>
          Leave group chat
        </p>
      </div>
    );
  }

  get userInfo() {
    return JSON.parse(localStorage.getItem('userInfo'));
  }
}

GroupChatInfo.propTypes = {
  leaveGroup: PropTypes.func.isRequired,
  chatId: PropTypes.string.isRequired,
  groupInfo: PropTypes.object,
  updateGroupTitleNotice: PropTypes.func,
  updateListGroupName: PropTypes.func,
  allGroupChats: PropTypes.instanceOf(Map),
  homePageList: PropTypes.array,
};

GroupChatInfo.defaultProps = {
  groupInfo: {},
  updateGroupTitleNotice() {},
  updateListGroupName() {},
  allGroupChats: new Map(),
  homePageList: [],
};
