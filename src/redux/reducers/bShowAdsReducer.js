import { ENABLE_SHOW_ADS, DISABLE_SHOW_ADS } from '../actions/bShowAdsAction';

const bShowAdsReducer = (previousState = true, action) => {
  console.log('bShowAdsReducer', action);
  switch (action.type) {
    case ENABLE_SHOW_ADS:
      return true;
    case DISABLE_SHOW_ADS:
      return false;
    default:
      return previousState;
  }
};

export { bShowAdsReducer };
