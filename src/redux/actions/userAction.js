const SET_USER_INFO = 'SET_USER_INFO';
const SET_BALANCE = 'SET_BALANCE';
const SET_USER_ROLE = 'SET_USER_ROLE';

const setUserInfoAction = (data = {}) => {
  return {
    type: SET_USER_INFO,
    data: { userInfo: data.data },
  };
};

const setBalanceAction = balance => {
  return {
    type: SET_BALANCE,
    data: { balance },
  };
};

const setRoleAction = role => {
  return {
    type: SET_USER_ROLE,
    data: { role },
  };
};

const setMembershipUpgradeInfo = membershipUpgradeInfo => {
  return {
    type: SET_USER_INFO,
    data: { membershipUpgradeInfo },
  };
};

export {
  SET_USER_INFO,
  SET_BALANCE,
  SET_USER_ROLE,
  setUserInfoAction,
  setRoleAction,
  setBalanceAction,
  setMembershipUpgradeInfo,
};
