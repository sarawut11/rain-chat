/* eslint-disable react/prefer-stateless-function */
/* eslint-disable react/no-multi-comp */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Drawer, Row, Col, Button } from 'antd';
import './styles.scss';
import notification from '../Notification';

class PersonalInfo extends Component {
  goToChat = () => {
    this.props.history.push(`/private_chat/${this.props.userInfo.user_id}`);
    this.props.hide();
  };

  deleteContact = () => {
    const myInfo = JSON.parse(localStorage.getItem('userInfo'));
    const {
      userInfo,
      deleteHomePageList,
      homePageList,
      deletePrivateChat,
      allPrivateChats,
    } = this.props;
    window.socket.emit(
      'deleteContact',
      {
        from_user: myInfo.user_id,
        to_user: userInfo.user_id,
      },
      res => {
        if (res.code === 200) {
          deleteHomePageList({ homePageList, chatId: userInfo.user_id });
          deletePrivateChat({ allPrivateChats, chatId: userInfo.user_id });
          this.props.hide();
          notification('Successfully deleted contact', 'success', 2);
        }
      },
    );
  };

  get isContact() {
    return (
      this.props.homePageList &&
      this.props.homePageList.find(e => e.user_id === this.props.userInfo.user_id)
    );
  }

  render() {
    const {
      userInfo,
      modalVisible,
      hide,
      showContactButton,
      showShareIcon,
      showShareModal,
    } = this.props;

    const { username, name, intro, email, role } = userInfo;
    return (
      <Drawer title={name} visible={modalVisible} onClose={hide} className="user-info-drawer">
        <Row gutter={[0, 20]}>
          {intro && (
            <Col span={24}>
              <p>{intro}</p>
            </Col>
          )}
          {username && (
            <Col span={24}>
              <p>Username</p>
              <h3>@{username}</h3>
            </Col>
          )}
          {email && (
            <Col span={24}>
              <p>Email</p>
              <h3>{email}</h3>
            </Col>
          )}
          {/* <Col span={24}>
            <p>Role</p>
            <h3>{role || 'Free member'}</h3>
          </Col> */}
          {showContactButton && (
            <Col span={24}>
              {showContactButton && (
                <Button
                  type="primary"
                  onClick={this.goToChat}
                  style={{ width: '100%', marginBottom: 10 }}
                >
                  Send Message
                </Button>
              )}

              {this.isContact && (
                <Button
                  type="primary"
                  danger
                  onClick={this.deleteContact}
                  style={{ width: '100%' }}
                >
                  Remove from contact
                </Button>
              )}
            </Col>
          )}
          {showShareIcon && (
            <Col span={24}>
              <svg onClick={showShareModal} className="icon shareIcon" aria-hidden="true">
                <use xlinkHref="#icon-share" />
              </svg>
            </Col>
          )}
        </Row>
      </Drawer>
    );
  }
}

PersonalInfo.propTypes = {
  userInfo: PropTypes.object,
  hide: PropTypes.func,
  modalVisible: PropTypes.bool,
  homePageList: PropTypes.array,
  deleteHomePageList: PropTypes.func,
  deletePrivateChat: PropTypes.func,
  allPrivateChats: PropTypes.instanceOf(Map),
  showContactButton: PropTypes.bool,
  showShareIcon: PropTypes.bool,
  showShareModal: PropTypes.func,
};

PersonalInfo.defaultProps = {
  userInfo: {},
  hide() {},
  modalVisible: false,
  homePageList: undefined,
  deleteHomePageList() {},
  deletePrivateChat() {},
  allPrivateChats: new Map(),
  showContactButton: true,
  showShareIcon: false,
  showShareModal() {},
};

export default withRouter(PersonalInfo);
