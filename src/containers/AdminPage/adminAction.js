const SET_ADMIN = 'SET_ADMIN';
const UPDATE_ADMIN = 'UPDATE_ADMIN';

const setAdminAction = (admin = {}) => {
  console.log('\n---    set admin action   ---\n', admin);

  return {
    type: SET_ADMIN,
    data: { usersList: admin.data },
  };
};

const updateRoleAction = admin => {
  console.log('edit ads action', admin);
  const { adminState, userId, role } = admin;
  const usersList = [...adminState.usersList];
  usersList.forEach((item, index) => {
    if (item.id === userId) {
      usersList[index].role = role;
    }
  });

  const adminStateCopy = {
    ...adminState,
    usersList,
  };

  return { type: SET_ADMIN, data: adminStateCopy };
};

export { SET_ADMIN, UPDATE_ADMIN, setAdminAction, updateRoleAction };
