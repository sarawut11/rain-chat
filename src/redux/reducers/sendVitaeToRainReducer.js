import { SET_VITAE_TO_RAIN } from '../actions/sendVitaeToRainAction';
import { SEND_ACTUAL_TOKEN } from '../../constants/vitaeToRain';

const initialState = {
  vitaeAmount: 0,
  walletAddress: null,
  vitaeToRainMode: SEND_ACTUAL_TOKEN,
};

const sendVitaeToRainReducer = (previousState = initialState, action) => {
  switch (action.type) {
    case SET_VITAE_TO_RAIN:
      return { ...previousState, ...action.data };
    default:
      return previousState;
  }
};

export { sendVitaeToRainReducer };
