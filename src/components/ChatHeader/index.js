import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Tooltip } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import './style.scss';

class ChatHeader extends Component {
  clickToBack = () => {
    this.props.history.push('/');
  };

  _clickChatInfo = () => {
    const { showGroupChatInfo, showPersonalInfo, chatType, hasShowed } = this.props;
    if (chatType === 'group') {
      showGroupChatInfo(!hasShowed);
    } else if (chatType === 'private') {
      showPersonalInfo();
    }
  };

  _showShareModal = () => {
    this.props.showShareModal();
  };

  render() {
    const { title, chatType, showShareIcon, groupId } = this.props;
    const icon = chatType === 'group' ? '#icon-group' : '#icon-people';
    const isRobotChat = chatType === 'robot';
    return (
      <div className="chat-header-wrapper">
        <svg onClick={this.clickToBack} className="icon back-icon" aria-hidden="true">
          <use xlinkHref="#icon-back1" />
        </svg>
        <div className="chat-title">
          {groupId && groupId === 'vitae-rain-group' && (
            <img src="../../assets/vitae-logo.png" alt="vitae-logo" />
          )}
          {title}
        </div>
        {groupId && groupId === 'vitae-rain-group' ? (
          <Tooltip title="Send Vitae to Rain" color="green" key="send-vitae-btn">
            <Button type="primary">
              <SendOutlined />
            </Button>
          </Tooltip>
        ) : (
          showShareIcon && (
            <svg onClick={this._showShareModal} className="icon shareIcon" aria-hidden="true">
              <use xlinkHref="#icon-share" />
            </svg>
          )
        )}
        {!isRobotChat && (
          <svg onClick={this._clickChatInfo} className="icon information-icon" aria-hidden="true">
            <use xlinkHref={icon} />
          </svg>
        )}
      </div>
    );
  }
}

export default withRouter(ChatHeader);

ChatHeader.propTypes = {
  title: PropTypes.string,
  history: PropTypes.object,
  chatType: PropTypes.string.isRequired,
  showGroupChatInfo: PropTypes.func,
  showPersonalInfo: PropTypes.func,
  hasShowed: PropTypes.bool,
  showShareIcon: PropTypes.bool,
};

ChatHeader.defaultProps = {
  title: '',
  history: undefined,
  showGroupChatInfo: undefined,
  showPersonalInfo: undefined,
  hasShowed: false,
  showShareIcon: false,
};
