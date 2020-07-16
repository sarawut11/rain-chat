const SET_STATIC_ADS = 'SET_STATIC_ADS';

const setStaticAdsAction = (staticAds = {}) => {
  return {
    type: SET_STATIC_ADS,
    data: { ads: staticAds },
  };
};

export { SET_STATIC_ADS, setStaticAdsAction };
