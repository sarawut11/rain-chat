import {
  SET_ADS,
  CREATE_ADS,
  UPDATE_ADS,
  DELETE_ADS,
  REQUEST_ADS,
  UPDATE_ADS_STATUS,
  formatAdsList,
} from './adsAction';

const ADS = {
  ADSLIST: 'adsList',
};

const initialState = {
  [ADS.ADSLIST]: [],
  createdAdsList: [],
  pendingAdsList: [],
  approvedAdsList: [],
  rejectedAdsList: [],
  paidAdsList: [],
  pendingPurchaseAdsList: [],
};

// const userInfo = JSON.parse(localStorage.getItem('userInfo'));
// const previousSettings =
//   userInfo && JSON.parse(localStorage.getItem(`settings-${userInfo.userId}`));

const setAdsReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case CREATE_ADS:
    case UPDATE_ADS:
    case DELETE_ADS:
    case REQUEST_ADS:
    case SET_ADS:
      return { ...previousState, ...action.data };
    case UPDATE_ADS_STATUS:
      try {
        const { adsList } = previousState;
        const { adsId, status } = action.data;

        adsList.forEach((ads, index) => {
          if (ads.id === adsId) {
            adsList[index].status = status;
          }
        });

        return { ...previousState, ...formatAdsList(adsList) };
      } catch (e) {
        console.log(e);
        return previousState;
      }
    default:
      return previousState;
  }
};

export { setAdsReducer, ADS };
