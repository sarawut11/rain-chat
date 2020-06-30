import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CreateGroupModal from '../CreateGroupModal';
import './style.scss';
import SearchBox from '../SearchBox';
import MyInfo from '../MyInfo';

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showGroupModal: false,
    };
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
  }

  confirm = ({ groupName, groupNotice }) => {
    this.setState({
      showGroupModal: false,
    });
    this.createGroup({ groupName, groupNotice });
  };

  createGroup = ({ groupName, groupNotice }) => {
    const { name, userId } = this._userInfo;
    const data = {
      name: groupName,
      description: groupNotice,
      creatorId: userId,
      // createTime: Date.parse(new Date()) / 1000
    };
    window.socket.emit('createGroup', data, res => {
      const {
        addGroupMessageAndInfo,
        updateHomePageList,
        homePageList,
        allGroupChats,
      } = this.props;
      const members = [
        {
          userId,
          name,
          status: 1,
        },
      ];
      const groupInfo = Object.assign({ members }, res);
      res.message = `${name}: Create group successfully!`;
      res.time = res.createTime;
      res.fromUser = res.creatorId;
      updateHomePageList({ data: res, homePageList });
      addGroupMessageAndInfo({
        allGroupChats,
        message: { ...res, name },
        groupId: res.groupId,
        groupInfo,
      });
      this.props.history.push(`/group_chat/${res.groupId}`);
    });
  };

  openModal = () => {
    this.setState({
      showGroupModal: true,
    });
  };

  cancel = () => {
    this.setState({
      showGroupModal: false,
    });
  };

  render() {
    const { isSearching, searchFieldChange } = this.props;
    const { role } = this._userInfo;
    return (
      <div className="header-wrapper">
        <MyInfo />
        <SearchBox searchFieldChange={searchFieldChange} isSearching={isSearching} />
        {(role === 'UPGRADED' || role === 'OWNER') && (
          <span className="add" onClick={this.openModal}>
            <svg className="icon" aria-hidden="true">
              <use xlinkHref="#icon-add" />
            </svg>
          </span>
        )}
        {role !== 'UPGRADED' && role !== 'OWNER' && <span />}
        <CreateGroupModal
          title="Create Group"
          modalVisible={this.state.showGroupModal}
          confirm={args => this.confirm(args)}
          hasCancel
          hasConfirm
          cancel={this.cancel}
        />
      </div>
    );
  }
}

Header.propTypes = {
  updateHomePageList: PropTypes.func,
  homePageList: PropTypes.array,
  allGroupChats: PropTypes.object,
  searchFieldChange: PropTypes.func,
  isSearching: PropTypes.bool,
  addGroupMessageAndInfo: PropTypes.func,
};

Header.defaultProps = {
  updateHomePageList: undefined,
  homePageList: [],
  allGroupChats: new Map(),
  searchFieldChange: undefined,
  isSearching: false,
  addGroupMessageAndInfo() {},
};
