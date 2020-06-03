const SET_ADS = 'SET_ADS';
const CREATE_ADS = 'CREATE_ADS';
const UPDATE_ADS = 'UPDATE_ADS';
const DELETE_ADS = 'DELETE_ADS';

const setAdsAction = (ads = {}) => ({
  type: SET_ADS,
  data: { adsList: ads.data },
});

const createAdsAction = ads => {
  const { id, user_id, asset_link, link, button_name, title, description, time, adsState } = ads;
  // const adsStateCopy = JSON.parse(JSON.stringify(adsState));
  // adsStateCopy.adsList = [
  //   ...adsStateCopy.adsList
  // ];
  const adsStateCopy = {
    ...adsState,
    adsList: [
      ...adsState.adsList,
      { id, user_id, asset_link, link, button_name, title, description, time },
    ],
  };

  return { type: CREATE_ADS, data: adsStateCopy };
};

const editAdsAction = ads => {
  console.log('edit ads action', ads);
  const { id, user_id, asset_link, link, button_name, title, description, time, adsState } = ads;
  const adsList = [...adsState.adsList];
  adsList.forEach((item, index) => {
    if (item.id == id) {
      adsList[index] = { id, user_id, asset_link, link, button_name, title, description, time };
    }
  });
  const adsStateCopy = {
    ...adsState,
    adsList: [...adsList],
  };

  return { type: UPDATE_ADS, data: adsStateCopy };
};

const deleteAdsAction = ads => {
  const { id, adsState } = ads;
  let adsList = [...adsState.adsList];
  let deletedIndex = adsList.length;
  adsList.forEach((item, index) => {
    if (item.id == id) {
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
    adsList: [...adsList],
  };

  return { type: UPDATE_ADS, data: adsStateCopy };
};

export {
  SET_ADS,
  CREATE_ADS,
  UPDATE_ADS,
  DELETE_ADS,
  setAdsAction,
  createAdsAction,
  editAdsAction,
  deleteAdsAction,
};
