/* eslint-disable import/first */
/* eslint-disable no-unused-vars */
import {
  ADS_APPROVED,
  ADS_PAID,
  ADS_CREATED,
  ADS_PENDING,
  ADS_PENDING_CONFIRM,
  ADS_PENDING_PURCHASE,
  ADS_REJECTED,
  ADS_TYPE_NONE,
  ADS_TYPE_RAIN_ROOM,
  ADS_TYPE_STATIC,
} from '../../constants/ads';

const SET_ADS = 'SET_ADS';
const CREATE_ADS = 'CREATE_ADS';
const UPDATE_ADS = 'UPDATE_ADS';
const DELETE_ADS = 'DELETE_ADS';
const REQUEST_ADS = 'REQUEST_ADS';

const formatAdsList = adsList => {
  let createdAdsList = [...adsList];
  createdAdsList = createdAdsList.filter(item => {
    return item.status === ADS_CREATED;
  });

  let pendingAdsList = [...adsList];
  pendingAdsList = pendingAdsList.filter(item => {
    return item.status === ADS_PENDING;
  });

  let approvedAdsList = [...adsList];
  approvedAdsList = approvedAdsList.filter(item => {
    return item.status === ADS_APPROVED;
  });

  let rejectedAdsList = [...adsList];
  rejectedAdsList = rejectedAdsList.filter(item => {
    return item.status === ADS_REJECTED;
  });

  let paidAdsList = [...adsList];
  paidAdsList = paidAdsList.filter(item => {
    return item.status === ADS_PAID;
  });

  let pendingPurchaseAdsList = [...adsList];
  pendingPurchaseAdsList = pendingPurchaseAdsList.filter(item => {
    return item.status === ADS_PENDING_PURCHASE;
  });

  let pendingConfirmAdsList = [...adsList];
  pendingConfirmAdsList = pendingConfirmAdsList.filter(item => {
    return item.status === ADS_PENDING_CONFIRM;
  });

  return {
    createdAdsList,
    pendingAdsList,
    approvedAdsList,
    rejectedAdsList,
    paidAdsList,
    pendingConfirmAdsList,
    pendingPurchaseAdsList,
  };
};

const setAdsAction = (ads = {}) => {
  console.log('\n---    set ads action   ---\n', ads);
  const adsList = [...ads.data];

  return {
    type: SET_ADS,
    data: { adsList: ads.data, ...formatAdsList(adsList) },
  };
};

const createAdsAction = ads => {
  const { adsState } = ads;
  const adsList = [...adsState.adsList, { ...ads.ads }];

  const adsStateCopy = {
    ...adsState,
    adsList,
    ...formatAdsList(adsList),
  };

  return { type: CREATE_ADS, data: adsStateCopy };
};

const editAdsAction = ads => {
  console.log('edit ads action', ads);
  const { adsState } = ads;
  const adsList = [...adsState.adsList];
  adsList.forEach((item, index) => {
    if (item.id === ads.ads.id) {
      adsList[index] = { ...ads.ads };
    }
  });

  const adsStateCopy = {
    ...adsState,
    adsList,
    ...formatAdsList(adsList),
  };

  return { type: UPDATE_ADS, data: adsStateCopy };
};

const deleteAdsAction = ads => {
  const { id, adsState } = ads;
  let adsList = [...adsState.adsList];
  let deletedIndex = adsList.length;
  adsList.forEach((item, index) => {
    if (item.id === id) {
      deletedIndex = index;
    }
  });

  if (deletedIndex < adsList.length) {
    delete adsList[deletedIndex];
    adsList = adsList.filter(element => {
      return element !== undefined;
    });
  }

  const adsStateCopy = {
    ...adsState,
    adsList,
    ...formatAdsList(adsList),
  };

  return { type: DELETE_ADS, data: adsStateCopy };
};

const requestAdsAction = ads => {
  const { id, status, adsState } = ads;
  const adsList = [...adsState.adsList];
  adsList.forEach((item, index) => {
    if (item.id === id) {
      adsList[index].status = status;
    }
  });

  const adsStateCopy = {
    ...adsState,
    adsList,
    ...formatAdsList(adsList),
  };

  return { type: REQUEST_ADS, data: adsStateCopy };
};

export {
  SET_ADS,
  CREATE_ADS,
  UPDATE_ADS,
  DELETE_ADS,
  REQUEST_ADS,
  setAdsAction,
  createAdsAction,
  editAdsAction,
  deleteAdsAction,
  requestAdsAction,
};
