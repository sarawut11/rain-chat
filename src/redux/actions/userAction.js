const SET_USER_INFO = 'SET_USER_INFO';

const setUserInfoAction = (userInfo = {}) => {
  console.log('\n---    set user info   ---\n', userInfo);

  return {
    type: SET_USER_INFO,
    data: { userInfo },
  };
};

export { SET_USER_INFO, setUserInfoAction };
