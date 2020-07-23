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
      try {
        const user_info = JSON.parse(localStorage.getItem('userInfo'));
        localStorage.setItem('userInfo', JSON.stringify({ ...user_info, ...action.data.userInfo }));
        return { ...previousState, ...action.data };
      } catch (e) {
        console.log(e);
        return previousState;
      }
    default:
      return previousState;
  }
};

export { userReducer };
