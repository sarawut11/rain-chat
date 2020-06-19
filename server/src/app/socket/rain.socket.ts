import { socketServer } from "./app.socket";
import { ServicesContext, RainContext } from "../context";
import { authVerify } from "../middlewares/verify";
import { Ads, User } from "../models";
import { socketEventNames } from "./resource.socket";

export const subscribeAdsReward = (token) => {
  const userInfo = authVerify(token);
  if (userInfo === false) {
    return;
  }
  const rainContext = RainContext.getInstance();
  const { id, username } = userInfo;
  rainContext.addUserToRainAds(id);
};

export const updateAdsStatus = async (adsId) => {
  const { userService, adsService } = ServicesContext.getInstance();
  const ads: Ads[] = await adsService.findAdsById(adsId);
  const user: User[] = await userService.findUserById(ads[0].userId);
  socketServer.emitTo(user[0].socketid, socketEventNames.UpdateAdsStatus, {
    adsId,
    username: user[0].username,
    status: ads[0].status
  }, (error) => console.error(error.message));
};