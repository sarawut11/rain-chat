import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { toNormalTime } from '../../utils/transformTime';
import UserAvatar from '../UserAvatar';
import GroupAvatar from '../GroupAvatar';
import './styles.scss';

// eslint-disable-next-line react/prefer-stateless-function
class ListItems extends Component {
  _clickItem = ({ chatFromId, isGroupChat }) => {
    this.props.clickItem(chatFromId);
    const chatUrl = isGroupChat ? `/group_chat/${chatFromId}` : `/private_chat/${chatFromId}`;
    this.props.history.push(chatUrl);
  };

  render() {
    const { dataList, allGroupChats, match, showAsContacts } = this.props;
    const listItems =
      dataList &&
      dataList.map((data, index) => {
        let message = data.message;
        const isShareUrl = message && /::share::{"/.test(message);
        if (isShareUrl) {
          message = '[Invitation card]';
        }
        const chatFromId = data.to_group_id || (data.user_id && data.user_id.toString());
        const isGroupChat = !!data.to_group_id;
        let GroupMembers;
        let groupId;
        if (isGroupChat) {
          const chatItem = allGroupChats && allGroupChats.get(data.to_group_id);
          GroupMembers = chatItem && chatItem.groupInfo && chatItem.groupInfo.members;
          groupId = chatItem && chatItem.groupInfo && chatItem.groupInfo.to_group_id;
        }
        const { params } = match;
        const unreadColor = data.to_group_id ? 'groupUnread' : 'privateUnread';
        let unreadCircular;
        switch (data.unread && data.unread.toString().length) {
          case 2:
            unreadCircular = 'twoDigitsUnread';
            break;
          case 3:
            unreadCircular = 'threeDigitsUnread';
            break;
          default:
            unreadCircular = 'oneDigitUnread';
        }
        return (
          <li
            key={index}
            style={
              !showAsContacts && (params.user_id || params.to_group_id) === chatFromId
                ? { backgroundColor: '#f5f5f5' }
                : {}
            }
            onClick={() => this._clickItem({ chatFromId, isGroupChat })}
            value={chatFromId}
          >
            {isGroupChat ? (
              <GroupAvatar members={GroupMembers || []} groupId={groupId} />
            ) : (
              <UserAvatar
                src={data.avatar}
                name={data.name}
                size="46"
                showLogo={!!data.github_id}
              />
            )}

            {!!data.unread && !showAsContacts && (
              <span className={classnames(unreadColor, unreadCircular)}>
                {data.unread > 99 ? '99+' : data.unread}
              </span>
            )}

            <div className="content">
              <div className="title">
                <p className="name">{data.name}</p>
                {!showAsContacts && (
                  <span className="time">{!!data.time && toNormalTime(data.time)}</span>
                )}
              </div>
              {!showAsContacts && (
                <div className="message">
                  {data.showCallMeTip && <span className="callMe">[@me]</span>}
                  {message || 'No news'}
                </div>
              )}
            </div>
          </li>
        );
      });
    return <ul className="homePageList">{listItems}</ul>;
  }
}

export default withRouter(ListItems);

ListItems.propTypes = {
  allGroupChats: PropTypes.instanceOf(Map),
  dataList: PropTypes.array,
  clickItem: PropTypes.func,
  match: PropTypes.object.isRequired,
  showAsContacts: PropTypes.bool,
};

ListItems.defaultProps = {
  allGroupChats: new Map(),
  dataList: [],
  clickItem() {},
  showAsContacts: false,
};
