import { combineReducers } from 'redux';

import {
  getHomePageListReducer,
  relatedCurrentChatReducer,
} from '../containers/HomePageList/homePageListReducer';
import { initAppReducer } from './reducers/initAppReducer';
import { shareReducer } from './reducers/shareReducer';
import { enableVitaePostReducer } from './reducers/enableVitaePost';
import { staticAdsReducer } from './reducers/staticAdsReducer';
import { bShowAdsReducer } from './reducers/bShowAdsReducer';
import { userReducer } from './reducers/userReducer';
import { sendVitaeToRainReducer } from './reducers/sendVitaeToRainReducer';
import { expenseReducer } from './reducers/expenseReducer';
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
  vitaePostEnabled: enableVitaePostReducer,
  staticAdsState: staticAdsReducer,
  bShowAds: bShowAdsReducer,
  user: userReducer,
  vitaeToRain: sendVitaeToRainReducer,
  expenseInfo: expenseReducer,
});
