const ENABLE_SHOW_ADS = 'ENABLE_SHOW_ADS';
const DISABLE_SHOW_ADS = 'DISABLE_SHOW_ADS';

const enableShowAds = () => {
  console.log('enableVitaePost');
  return {
    type: ENABLE_SHOW_ADS,
  };
};

const disableShowAds = () => {
  console.log('disableVitaePost');
  return {
    type: DISABLE_SHOW_ADS,
  };
};

export { ENABLE_SHOW_ADS, DISABLE_SHOW_ADS, enableShowAds, disableShowAds };
