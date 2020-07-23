import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserAvatar from '../UserAvatar';
import ProfileInfo from '../ProfileInfo';
import ShareModal from '../ShareModal';
import store from '../../redux/store';
import { setUserInfoAction } from '../../redux/actions/userAction';
import './styles.scss';

class MyInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showShareModal: false,
      showPersonalInfo: false,
    };
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
    return `${window.location.origin}/private_chat/${this.props.userInfo.userId}`;
  }

  render() {
    const { name, avatar, userId } = this.props.userInfo;
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
          userInfo={this.props.userInfo}
          shareLink={this.shareLink}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  userInfo: state.user.userInfo,
});

const mapDispatchToProps = dispatch => ({
  setUserInfo(arg) {
    dispatch(setUserInfoAction(arg));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MyInfo);
