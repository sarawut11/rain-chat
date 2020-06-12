import { SET_ADMIN, UPDATE_ADMIN } from './adminAction';

const initialState = {
  usersList: [],
};

const setAdminReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case UPDATE_ADMIN:
    case SET_ADMIN:
      return { ...previousState, ...action.data };
    default:
      return previousState;
  }
};

export { setAdminReducer };
