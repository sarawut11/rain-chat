import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { SET_USER_INFO, SET_BALANCE, SET_USER_ROLE } from '../actions/userAction';

const initialState = {
  userInfo: {},
  membershipUpgradeInfo: {
    usdPrice: null,
    vitaePrice: null,
    walletAddress: null,
    membershipUpgradePending: false,
    deadline: null,
  },
};

const initialUserReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      try {
        const user_info = JSON.parse(localStorage.getItem('userInfo'));
        localStorage.setItem('userInfo', JSON.stringify({ ...user_info, ...action.data.userInfo }));
        return { ...previousState, ...action.data };
      } catch (e) {
        // console.log(e);
        return previousState;
      }
    case SET_BALANCE:
      try {
        return {
          ...previousState,
          userInfo: { ...previousState.userInfo, balance: action.data.balance },
        };
      } catch (e) {
        // console.log(e);
        return previousState;
      }
    case SET_USER_ROLE:
      try {
        return {
          ...previousState,
          userInfo: { ...previousState.userInfo, role: action.data.role },
        };
      } catch (e) {
        // console.log(e);
        return previousState;
      }
    default:
      return previousState;
  }
};

const persistConfig = {
  key: 'userSetting',
  storage,
  whitelist: [],
};

export const userReducer = persistReducer(persistConfig, initialUserReducer);
