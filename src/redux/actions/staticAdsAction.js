const SET_STATIC_ADS = 'SET_ADMIN';

const setStaticAdsAction = (staticAds = {}) => {
  console.log('\n---    set static ads action   ---\n', staticAds);

  return {
    type: SET_STATIC_ADS,
    data: { ads: staticAds },
  };
};

export { SET_STATIC_ADS, setStaticAdsAction };
