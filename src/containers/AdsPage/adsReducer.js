import { SET_ADS } from './adsAction';

const ADS = {
  ADSLIST: 'adsList',
};

const initialState = {
  [ADS.ADSLIST]: [],
};

// const userInfo = JSON.parse(localStorage.getItem('userInfo'));
// const previousSettings =
//   userInfo && JSON.parse(localStorage.getItem(`settings-${userInfo.user_id}`));

const setAdsReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case SET_ADS:
      return { ...previousState, ...action.data };
    default:
      return previousState;
  }
};

export { setAdsReducer, ADS };
