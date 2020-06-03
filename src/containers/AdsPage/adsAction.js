const SET_ADS = 'SET_ADS';
const CREATE_ADS = 'CREATE_ADS';

const setAdsAction = (ads = {}) => ({
  type: SET_ADS,
  data: { adsList: ads.data },
});

const createAdsAction = ads => {
  const { asset_link, link, button_name, title, description, adsState } = ads;
  // const adsStateCopy = JSON.parse(JSON.stringify(adsState));
  // adsStateCopy.adsList = [
  //   ...adsStateCopy.adsList
  // ];
  const adsStateCopy = {
    ...adsState,
    adsList: [...adsState.adsList, { asset_link, link, button_name, title, description }],
  };

  return { type: CREATE_ADS, data: adsStateCopy };
};

export { SET_ADS, CREATE_ADS, setAdsAction, createAdsAction };
