import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Divider } from 'antd';
import Fuse from 'fuse.js';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import Header from '../../containers/Header';
import './index.scss';
import ListItems from '../ListItems';
import Chat from '../../modules/Chat';
import StaticAdsPanel from '../StaticAdsPanel';
import { getUserLS } from '../../utils/user';

class HomePageList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearching: false,
      contactedItems: [],
      showSearchUser: true,
      showSearchGroup: true,
      searchResultTitle: {
        user: 'Users in your contact list',
        group: 'Groups in your contact list',
      },
    };
    this._userInfo = getUserLS();
    this._filedStr = null;
    this._chat = new Chat();
    this._cleanedUnread = false;
  }

  componentDidUpdate() {
    if (this._cleanedUnread || !this.props.initializedApp) return;
    this._cleanUnreadWhenReload();
  }

  _cleanUnreadWhenReload = () => {
    const { homePageList } = this.props;
    const chatFromId = window.location.pathname.split(/^\/\S+_chat\//)[1];
    const filter = homePageList.filter(
      e =>
        chatFromId &&
        (chatFromId === e.groupId || chatFromId === (e.userId && e.userId.toString())),
    );
    const goal = filter[0];
    if (goal && goal.unread !== 0) {
      this._chat.clearUnreadHandle({ homePageList, chatFromId });
      this._cleanedUnread = true;
    }
  };

  searchFieldChange(field) {
    this._filedStr = field.toString();
    this.setState({
      showSearchUser: true,
      showSearchGroup: true,
      searchResultTitle: {
        user: 'Users in your contact list',
        group: 'Groups in your contact list',
      },
    });
    if (this._filedStr.length > 0) {
      const { homePageList } = this.props;
      const homePageListCopy = [...List(homePageList)];
      const fuse = new Fuse(homePageListCopy, this.filterOptions);
      const contactedItems = fuse.search(this._filedStr);
      this.setState({ isSearching: true, contactedItems });
    } else {
      this.setState({ isSearching: false });
    }
  }

  get filterOptions() {
    const options = {
      shouldSort: true,
      threshold: 0.3,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: ['name'],
    };
    return options;
  }

  searchInDB({ searchUser }) {
    window.socket.emit('findMatch', { field: this._filedStr, searchUser }, data => {
      const newMatchResult = [];

      if (data.searchUser) {
        this.setState(state => ({
          showSearchUser: false,
          searchResultTitle: { ...state.searchResultTitle, user: 'All users' },
        }));

        data.fuzzyMatchResult.forEach(element => {
          element.userId = element.id;
          const contactedIndex = this.state.contactedItems.findIndex(item => {
            return item.userId === element.userId;
          });

          if (contactedIndex === -1) {
            newMatchResult.push(element);
          }
        });
      } else {
        this.setState(state => ({
          showSearchGroup: false,
          searchResultTitle: { ...state.searchResultTitle, group: 'All groups' },
        }));

        data.fuzzyMatchResult.forEach(element => {
          const contactedIndex = this.state.contactedItems.findIndex(item => {
            return item.id === element.id;
          });

          if (contactedIndex === -1) {
            newMatchResult.push(element);
          }
        });
      }

      console.log(
        '\n ---- searchInDB --- \n',
        this.state.contactedItems,
        data.fuzzyMatchResult,
        newMatchResult,
      );
      this.setState(state => ({
        contactedItems: [...state.contactedItems, ...newMatchResult],
      }));
    });
  }

  clickItemHandle = ({ homePageList, chatFromId }) => {
    if (this.state.isSearching) {
      this.setState({ isSearching: false });
    }
    this._chat.clearUnreadHandle({ homePageList, chatFromId });
    // clear [@Me]
    this.props.showCallMeTip({ homePageList, chatFromId, showCallMeTip: false });
  };

  render() {
    const { homePageList, allGroupChats } = this.props;
    homePageList.sort((a, b) => b.time - a.time);
    const {
      isSearching,
      contactedItems,
      showSearchUser,
      showSearchGroup,
      searchResultTitle,
    } = this.state;
    const contactedUsers = contactedItems.filter(
      e => e.userId && e.userId !== this._userInfo.userId,
    );
    const contactedGroups = contactedItems.filter(e => e.groupId);
    return (
      <div className="home-page-list-wrapper">
        <Header
          searchFieldChange={field => this.searchFieldChange(field)}
          isSearching={isSearching}
        />
        <div className="home-page-list-content">
          {/* TODO */}
          {/* {this.state.showSpinner && <Spinner /> } */}
          {isSearching ? (
            <div className="searchResult">
              <p className="searchResultTitle">{searchResultTitle.user}</p>
              {contactedUsers.length ? (
                <ListItems
                  isSearching={isSearching}
                  dataList={contactedUsers}
                  allGroupChats={allGroupChats}
                  clickItem={chatFromId => this.clickItemHandle({ homePageList, chatFromId })}
                />
              ) : (
                <p className="search-none">No users</p>
              )}
              {showSearchUser && (
                <p className="clickToSearch" onClick={() => this.searchInDB({ searchUser: true })}>
                  Search for all users
                </p>
              )}

              <Divider />

              <p className="searchResultTitle">{searchResultTitle.group}</p>
              {contactedGroups.length ? (
                <ListItems
                  isSearching={isSearching}
                  dataList={contactedGroups}
                  allGroupChats={allGroupChats}
                  clickItem={chatFromId => this.clickItemHandle({ homePageList, chatFromId })}
                />
              ) : (
                <p className="search-none">No groups</p>
              )}
              {showSearchGroup && (
                <p className="clickToSearch" onClick={() => this.searchInDB({ searchUser: false })}>
                  Search for all groups
                </p>
              )}
            </div>
          ) : (
            <ListItems
              dataList={homePageList}
              allGroupChats={allGroupChats}
              showRobot
              clickItem={chatFromId => this.clickItemHandle({ homePageList, chatFromId })}
            />
          )}
          <StaticAdsPanel />
        </div>
      </div>
    );
  }
}

export default withRouter(HomePageList);

HomePageList.propTypes = {
  allGroupChats: PropTypes.instanceOf(Map),
  homePageList: PropTypes.array,
  showCallMeTip: PropTypes.func,
  initializedApp: PropTypes.bool,
};

HomePageList.defaultProps = {
  allGroupChats: new Map(),
  homePageList: [],
  showCallMeTip() {},
  initializedApp: false,
};
