const SET_ADMIN = 'SET_ADMIN';
const ADD_MODERATORS = 'ADD_MODERATORS';
const REMOVE_MODER = 'REMOVE_MODER';
const UPDATE_ADMIN = 'UPDATE_ADMIN';

const setAdminAction = (admin = {}) => {
  // console.log('\n---    set admin action   ---\n', admin);

  return {
    type: SET_ADMIN,
    data: { ...admin.data },
  };
};

const addModerators = ({ addedModers }) => {
  return {
    type: ADD_MODERATORS,
    data: { addedModers },
  };
};

const removeModer = ({ moder }) => {
  return {
    type: REMOVE_MODER,
    data: { moder },
  };
};

const updateRoleAction = admin => {
  // console.log('edit ads action', admin);
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

export {
  SET_ADMIN,
  UPDATE_ADMIN,
  ADD_MODERATORS,
  REMOVE_MODER,
  setAdminAction,
  updateRoleAction,
  addModerators,
  removeModer,
};
