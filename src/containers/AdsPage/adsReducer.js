import { SET_ADS, CREATE_ADS, UPDATE_ADS, DELETE_ADS, REQUEST_ADS } from './adsAction';

const ADS = {
  ADSLIST: 'adsList',
};

const initialState = {
  [ADS.ADSLIST]: [],
  createdAdsList: [],
  pendingAdsList: [],
  approvedAdsList: [],
  rejectedAdsList: [],
};

// const userInfo = JSON.parse(localStorage.getItem('userInfo'));
// const previousSettings =
//   userInfo && JSON.parse(localStorage.getItem(`settings-${userInfo.user_id}`));

const setAdsReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case CREATE_ADS:
    case UPDATE_ADS:
    case DELETE_ADS:
    case REQUEST_ADS:
    case SET_ADS:
      return { ...previousState, ...action.data };
    default:
      return previousState;
  }
};

export { setAdsReducer, ADS };
