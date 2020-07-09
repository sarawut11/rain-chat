const SET_VITAE_TO_RAIN = 'SET_VITAE_TO_RAIN';

const setVitaeToRainAction = (data = {}) => {
  console.log('\n\n\n------     setVitaeToRainAction      -----\n\n\n', data);
  return {
    type: SET_VITAE_TO_RAIN,
    data,
  };
};

export { SET_VITAE_TO_RAIN, setVitaeToRainAction };
