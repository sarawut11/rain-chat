import { INIT_APP } from '../actions/initAppAction';

const initAppReducer = (previousState = false, action) => {
  console.log('initAppReducer', action);
  switch (action.type) {
    case INIT_APP:
      return action.data;
    default:
      return previousState;
  }
};

export { initAppReducer };
