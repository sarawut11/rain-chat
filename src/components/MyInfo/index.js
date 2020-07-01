import React, { Component } from 'react';
import UserAvatar from '../UserAvatar';
import ProfileInfo from '../ProfileInfo';
import ShareModal from '../ShareModal';
import store from '../../redux/store';
import './styles.scss';

class MyInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showShareModal: false,
      showPersonalInfo: false,
    };
    this._userInfo = JSON.parse(localStorage.getItem('userInfo'));
  }

  _showPersonalInfo = () => {
    this.setState(state => ({ showPersonalInfo: !state.showPersonalInfo }));
  };

  _showShareModal = () => {
    this.setState(state => ({
      showShareModal: !state.showShareModal,
      showPersonalInfo: false,
    }));
  };

  _closeShareModal = () => {
    this.setState({ showShareModal: false });
  };

  get shareLink() {
    return `${window.location.origin}/private_chat/${this._userInfo.userId}`;
  }

  render() {
    const { name, avatar, userId } = this._userInfo;
    const { allGroupChatsState, homePageListState } = store.getState();
    return (
      <div className="myInfo">
        <UserAvatar
          name={name}
          src={avatar}
          size="36"
          clickAvatar={this._showPersonalInfo}
          showLogo={false}
        />
        <ProfileInfo
          userInfo={this._userInfo}
          hide={this._showPersonalInfo}
          modalVisible={this.state.showPersonalInfo}
          showContactButton={false}
          showShareModal={this._showShareModal}
          showShareIcon
        />
        <ShareModal
          title="Share this contact to"
          modalVisible={this.state.showShareModal}
          chatId={userId}
          cancel={this._closeShareModal}
          allGroupChats={allGroupChatsState}
          homePageList={homePageListState}
          userInfo={this._userInfo}
          shareLink={this.shareLink}
        />
      </div>
    );
  }
}

export default MyInfo;
