const SET_VITAE_TO_RAIN = 'SET_VITAE_TO_RAIN';

const setVitaeToRainAction = (data = {}) => {
  return {
    type: SET_VITAE_TO_RAIN,
    data,
  };
};

export { SET_VITAE_TO_RAIN, setVitaeToRainAction };
