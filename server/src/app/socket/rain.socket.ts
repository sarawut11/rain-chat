import { socketServer } from "./app.socket";
import { ServicesContext, RainContext } from "../context";
import { authVerify } from "../middlewares/verify";

export const subscribeAdsReward = (token) => {
  const userInfo = authVerify(token);
  if (userInfo === false) {
    return;
  }
  const rainContext = RainContext.getInstance();
  const { id, username } = userInfo;
  rainContext.addUserToRainAds(id);
};