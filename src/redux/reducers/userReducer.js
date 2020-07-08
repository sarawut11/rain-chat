import { SET_USER_INFO } from '../actions/userAction';

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

const userReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      return { ...previousState, ...action.data };
    default:
      return previousState;
  }
};

export { userReducer };
