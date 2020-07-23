export const setUserLS = userInfo => {
  console.log('\n ---  setUserLS  --- \n', userInfo);
  if (!userInfo.username) {
    return;
  }
  const { id, username, email, name, role, token, userId, avatar } = userInfo;
  const newUserInfo = {
    id,
    username,
    email,
    name,
    role,
    token,
    userId,
    avatar,
  };

  const user_info = JSON.parse(localStorage.getItem('userInfo'));
  localStorage.setItem('userInfo', JSON.stringify({ ...user_info, ...newUserInfo }));
};

export const getUserLS = () => {
  const user_info = JSON.parse(localStorage.getItem('userInfo'));
  return user_info;
};
