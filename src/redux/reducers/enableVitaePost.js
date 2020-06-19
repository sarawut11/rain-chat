import { ENABLE_VITAE_POST, DISABLE_VITAE_POST } from '../actions/enableVitaePost';

const enableVitaePostReducer = (previousState = true, action) => {
  console.log('enableVitaePostReducer', action);
  switch (action.type) {
    case ENABLE_VITAE_POST:
      return true;
    case DISABLE_VITAE_POST:
      return false;
    default:
      return previousState;
  }
};

export { enableVitaePostReducer };
