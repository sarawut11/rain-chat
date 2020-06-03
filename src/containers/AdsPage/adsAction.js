const SET_ADS = 'SET_ADS';

const setAdsAction = (ads = {}) => ({
  type: SET_ADS,
  data: { adsList: ads.data },
});

export { SET_ADS, setAdsAction };
