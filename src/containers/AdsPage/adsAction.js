const SET_ADS = 'SET_ADS';
const CREATE_ADS = 'CREATE_ADS';
const UPDATE_ADS = 'UPDATE_ADS';
const DELETE_ADS = 'DELETE_ADS';
const REQUEST_ADS = 'REQUEST_ADS';

const formatAdsList = adsList => {
  let createdAdsList = [...adsList];
  createdAdsList = createdAdsList.filter(item => {
    return item.status === 0;
  });

  let pendingAdsList = [...adsList];
  pendingAdsList = pendingAdsList.filter(item => {
    return item.status === 1;
  });

  let approvedAdsList = [...adsList];
  approvedAdsList = approvedAdsList.filter(item => {
    return item.status === 2;
  });

  let rejectedAdsList = [...adsList];
  rejectedAdsList = rejectedAdsList.filter(item => {
    return item.status === 3;
  });

  let paidAdsList = [...adsList];
  paidAdsList = paidAdsList.filter(item => {
    return item.status === 4;
  });

  return { createdAdsList, pendingAdsList, approvedAdsList, rejectedAdsList, paidAdsList };
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
  // const adsStateCopy = JSON.parse(JSON.stringify(adsState));
  // adsStateCopy.adsList = [
  //   ...adsStateCopy.adsList
  // ];
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
