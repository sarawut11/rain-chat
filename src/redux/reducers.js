import { combineReducers } from 'redux';

import {
  getHomePageListReducer,
  relatedCurrentChatReducer,
} from '../containers/HomePageList/homePageListReducer';
import { initAppReducer } from './reducers/initAppReducer';
import { shareReducer } from './reducers/shareReducer';
import { fetchAllGroupChatsReducer } from '../containers/GroupChatPage/groupChatReducer';
import { fetchAllPrivateChatsReducer } from '../containers/PrivateChatPage/privateChatReducer';
import { setGlobalSettingsReducer } from '../containers/SettingPage/settingReducer';
import { setAdsReducer } from '../containers/AdsPage/adsReducer';
import { setAdminReducer } from '../containers/AdminPage/adminReducer';

export default combineReducers({
  homePageListState: getHomePageListReducer,
  allGroupChatsState: fetchAllGroupChatsReducer,
  allPrivateChatsState: fetchAllPrivateChatsReducer,
  relatedCurrentChat: relatedCurrentChatReducer,
  initAppState: initAppReducer,
  shareState: shareReducer,
  globalSettingsState: setGlobalSettingsReducer,
  adsState: setAdsReducer,
  adminState: setAdminReducer,
});
