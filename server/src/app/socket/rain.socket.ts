import { socketServer } from "./app.socket";
import { ServicesContext, RainContext } from "../context";

export const subscribeAdsReward = (userId) => {
  const rainContext = RainContext.getInstance();

  rainContext.addUserToRainAds(userId);
};