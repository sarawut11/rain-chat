import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Viewer from 'react-viewer';
import ChatItem from '../ChatItem';
import { toNormalTime } from '../../utils/transformTime';
import './styles.scss';
import sleep from '../../utils/sleep';
import notification from '../Notification';
import Chat from '../../modules/Chat';

class ChatContentList extends Component {
  constructor(props) {
    super(props);
    this._chat = new Chat();
    this._scrollHeight = 0;
    this._loadingNewMessages = false;
    this._executeNextLoad = true;
    this.state = {
      imageVisible: false,
      imageUrl: null,
    };
  }

  componentDidMount() {
    // this.updateBoldTags();
    this.scrollBottomRef.scrollIntoView();
  }

  componentDidUpdate(nextProps) {
    // this.updateBoldTags();

    if (nextProps.chatId !== this.props.chatId) {
      // go to another chat
      this._loadingNewMessages = false;
    }
    if (this._scrollHeight && this._loadingNewMessages) {
      this._ulRef.scrollTop = this._ulRef.scrollHeight - this._scrollHeight;
      this._loadingNewMessages = false;
      return;
    }
    if (nextProps.ChatContent !== this.props.ChatContent) {
      this.scrollBottomRef.scrollIntoView();
    }
  }

  updateBoldTags = () => {
    try {
      const ul = document.getElementsByClassName('chat-content-list')[0];
      const pList = ul.getElementsByTagName('p');
      for (let i = 0; i < pList.length; i += 1) {
        // console.log(pList[i].innerHTML, pList[i]);
        let newHtml = pList[i].innerHTML.toString();
        // console.log('newHtml:', newHtml);
        newHtml = newHtml.split('&lt;').join('<');
        newHtml = newHtml.split('&gt;').join('>');
        // newHtml = newHtml.replaceAll('&lt;', '<');
        // newHtml = newHtml.replaceAll('&gt;', '>');
        // newHtml.replace('&gt;', '</span>');
        pList[i].innerHTML = newHtml;
      }
    } catch (e) {
      // console.log(e);
    }
  };

  _lazyLoadMessage = () => {
    this._executeNextLoad = false;
    const { chats, chatId, ChatContent, chatType } = this.props;
    if (chatType === 'groupChat') {
      this._chat
        .lazyLoadGroupMessages({
          chats,
          chatId,
          start: ChatContent.length + 1,
          count: 20,
        })
        .then(() => {
          this._executeNextLoad = true;
        })
        .catch(error => {
          if (error === 'try again later') {
            sleep(3000).then(() => {
              this._executeNextLoad = true;
            });
          }
        });
    } else if (chatType === 'privateChat') {
      this._chat
        .lazyLoadPrivateChatMessages({
          chats,
          chatId,
          start: ChatContent.length + 1,
          count: 20,
        })
        .then(() => {
          this._executeNextLoad = true;
        })
        .catch(error => {
          if (error === 'try again later') {
            sleep(3000).then(() => {
              this._executeNextLoad = true;
            });
          }
        });
    }
    this._loadingNewMessages = true;
  };

  _onScroll = e => {
    if (!this._ulRef) return;
    const { scrollTop, scrollHeight, clientHeight } = e && e.target;
    this._scrollHeight = scrollHeight;
    if (scrollTop === 0 && scrollHeight !== clientHeight && this._executeNextLoad) {
      if (!this.props.shouldScrollToFetchData) {
        notification('For more information, please add a group first', 'warn');
        return;
      }
      this._lazyLoadMessage();
    }
  };

  clickImage = imageUrl => {
    this.setState({ imageUrl, imageVisible: true });
  };

  _closeImageView = () => {
    this.setState({ imageVisible: false });
  };

  render() {
    const { ChatContent, clickAvatar } = this.props;
    const listItems = ChatContent.map((item, index) => {
      let isMe;
      if (item.toUser) {
        // is private chat
        isMe = this.props.userInfo && this.props.userInfo.id === item.fromUser;
      } else if (item.groupId) {
        // is group chat
        isMe = this.props.userInfo && this.props.userInfo.id === item.fromUser;
      }
      const time = toNormalTime(item.time);
      const attachments = item.attachments;
      if (item.tip) {
        return (
          <li className="tip" key={index}>
            {item.message}
          </li>
        );
      }
      return (
        <li key={index}>
          <ChatItem
            me={isMe}
            img={item.avatar}
            msg={item.message}
            name={item.name}
            username={item.username}
            time={time}
            github_id={item.github_id}
            clickImage={this.clickImage}
            shouldScrollIntoView={!(this._scrollHeight && this._loadingNewMessages)}
            clickAvatar={() => clickAvatar(item.fromUser)}
            attachments={attachments}
          />
        </li>
      );
    });

    // console.log('\n --- ChatContentList --- \n', this);
    return (
      <ul
        className="chat-content-list"
        ref={el => {
          this._ulRef = el;
        }}
        onScroll={this._onScroll}
      >
        <Viewer
          visible={this.state.imageVisible}
          noNavbar
          onClose={this._closeImageView}
          images={[{ src: this.state.imageUrl, alt: '' }]}
        />
        {listItems}
        <div
          style={{ float: 'left', clear: 'both' }}
          ref={el => {
            this.scrollBottomRef = el;
          }}
        />
      </ul>
    );
  }
}

ChatContentList.propTypes = {
  ChatContent: PropTypes.array,
  chatId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  clickAvatar: PropTypes.func,
  chatType: PropTypes.string.isRequired,
  chats: PropTypes.instanceOf(Map),
  shouldScrollToFetchData: PropTypes.bool,
};

ChatContentList.defaultProps = {
  ChatContent: [],
  chatId: null,
  clickAvatar() {},
  chats: new Map(),
  shouldScrollToFetchData: true,
};

const mapStateToProps = state => ({
  userInfo: state.user.userInfo,
});

export default connect(mapStateToProps)(ChatContentList);
