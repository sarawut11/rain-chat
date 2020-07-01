import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Emoji } from 'emoji-mart';
import { MultiLineParser } from 'text-emoji-parser';
import Linkify from '../Linkify';
import UserAvatar from '../UserAvatar';
import './style.scss';
import Chat from '../../modules/Chat';

class ChatItem extends Component {
  constructor(props) {
    super(props);
    this._scrollIntoView = null;
    this._chat = new Chat();
  }

  clickToShare({ redirectUrl }) {
    this.props.history.push(redirectUrl);
  }

  _clickImage(imageUrl) {
    this.props.clickImage(imageUrl);
  }

  sharePersonalCard = shareObj => {
    const { name, userId } = shareObj;
    const redirectUrl = `/private_chat/${userId}`;
    return (
      <div
        className="shareCard"
        onClick={() => {
          this.clickToShare({ redirectUrl });
        }}
      >
        <p className="shareTitle">{` "${decodeURI(name)}"`}</p>
        <p className="shareButton">Click add as a contact</p>
      </div>
    );
  };

  shareGroupCard = shareObj => {
    const { name, groupId } = shareObj;
    const redirectUrl = `/group_chat/${groupId}`;
    return (
      <div
        className="shareCard"
        onClick={() => {
          this.clickToShare({ redirectUrl });
        }}
      >
        <p>Invite you to join the group:</p>
        <p className="shareTitle">{` "${decodeURI(name)}"`}</p>
        <p className="shareButton">Click to join</p>
      </div>
    );
  };

  _onloadImg = () => {
    clearTimeout(this._scrollIntoView);
    this._scrollIntoView = setTimeout(() => {
      const imgDom = document.querySelectorAll('.image-render img');
      const lastImgDom = imgDom[imgDom.length - 1];
      if (
        this.props.shouldScrollIntoView &&
        !this._chat.isScrollInBottom &&
        lastImgDom &&
        lastImgDom.complete
      ) {
        lastImgDom.scrollIntoView();
      }
    }, 0);
  };

  textRender = msg => {
    const isShareUrl = /^::share::{"/.test(msg);
    if (isShareUrl) {
      const shareObj = JSON.parse(msg.replace(/::share::/, ''));
      if (shareObj.groupId) {
        return <div className="msg-render">{this.shareGroupCard(shareObj)}</div>;
      }
      if (shareObj.userId) {
        return <div className="msg-render">{this.sharePersonalCard(shareObj)}</div>;
      }
    }

    return (
      <div className="msg-render">
        <Linkify>
          {MultiLineParser(
            msg,
            {
              SplitLinesTag: 'p',
              // eslint-disable-next-line no-useless-escape
              Rule: /(?:\:[^\:]+\:(?:\:skin-tone-(?:\d)\:)?)/gi,
            },
            Rule => (
              <Emoji
                className="msg-render"
                emoji={Rule}
                backgroundImageFn={() => 'https://cdn.aermin.top/emojione.png'}
                size={26}
                fallback={(emoji, props) => (emoji ? `:${emoji.short_names[0]}:` : props.emoji)}
              />
            ),
          )}
        </Linkify>
      </div>
    );
  };

  filesRender = attachments =>
    attachments.map(attachment => {
      if (attachment.type === 'image') {
        return (
          <div
            className="image-render"
            key={attachment.fileUrl}
            onClick={() => {
              this._clickImage(attachment.fileUrl);
            }}
          >
            <img src={attachment.fileUrl} onLoad={this._onloadImg} alt="" />
          </div>
        );
      }
      return (
        <a
          key={attachment.fileUrl}
          download
          href={`${attachment.fileUrl}?attname=${attachment.name}`}
          className="other-file-render"
        >
          {attachment.name || 'unknown file'}
          <svg className="icon" aria-hidden="true">
            <use xlinkHref="#icon-download" />
          </svg>
        </a>
      );
    });

  render() {
    const { me, img, time, name, msg, clickAvatar } = this.props;
    let attachments = this.props.attachments;
    if (typeof attachments === 'string') {
      attachments = JSON.parse(attachments);
    }
    // TODO: reduce needless render
    // console.log('attachments in chatItem', attachments);

    return (
      <div className="chat-item">
        {me ? (
          <div className="mychat">
            <UserAvatar name={name} src={img} size="40" />
            <div className="nt">
              {time && <span>{time}</span>}
              {name && <span>{name}</span>}
            </div>
            {attachments.length ? this.filesRender(attachments) : this.textRender(msg)}
          </div>
        ) : (
          <div className="otherchat">
            <UserAvatar name={name} src={img} size="40" clickAvatar={clickAvatar} />
            <div className="nt">
              {name && <span>{name}</span>}
              {time && <span>{time}</span>}
            </div>
            {attachments.length ? this.filesRender(attachments) : this.textRender(msg)}
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(ChatItem);

ChatItem.propTypes = {
  me: PropTypes.bool,
  img: PropTypes.string,
  name: PropTypes.string,
  time: PropTypes.string,
  msg: PropTypes.string,
  attachments: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  clickAvatar: PropTypes.func,
  shouldScrollIntoView: PropTypes.bool,
  clickImage: PropTypes.func,
};

ChatItem.defaultProps = {
  me: undefined,
  img: undefined,
  name: '',
  time: undefined,
  clickAvatar: undefined,
  msg: '',
  attachments: '[]',
  shouldScrollIntoView: true,
  clickImage() {},
};
