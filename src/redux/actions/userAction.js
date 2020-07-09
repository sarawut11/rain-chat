const SET_USER_INFO = 'SET_USER_INFO';

const setUserInfoAction = (data = {}) => {
  return {
    type: SET_USER_INFO,
    data: { userInfo: data.data },
  };
};

const setMembershipUpgradeInfo = membershipUpgradeInfo => {
  return {
    type: SET_USER_INFO,
    data: { membershipUpgradeInfo },
  };
};

export { SET_USER_INFO, setUserInfoAction, setMembershipUpgradeInfo };
