import { SET_STATIC_ADS } from '../actions/staticAdsAction';

const initialState = {
  ads: {},
};

const staticAdsReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case SET_STATIC_ADS:
      return { ...action.data };
    default:
      return previousState;
  }
};

export { staticAdsReducer };
