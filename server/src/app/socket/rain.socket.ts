import { authVerify } from "../middlewares/verify";
import { Ads, User } from "@models";
import { ServicesContext, RainContext } from "@context";
import { socketServer, socketEventNames } from "@sockets";

export const subscribeAdsReward = (token) => {
  const userInfo = authVerify(token);
  if (userInfo === false) {
    return;
  }
  const rainContext = RainContext.getInstance();
  const { id } = userInfo;
  rainContext.addUserToRainAds(id);
};

export const updateAdsStatus = async (adsId: number) => {
  const { userService, adsService } = ServicesContext.getInstance();
  const ads: Ads = await adsService.findAdsById(adsId);
  const user: User = await userService.findUserById(ads.userId);
  socketServer.emitTo(user.socketid, socketEventNames.UpdateAdsStatus, {
    adsId,
    username: user.username,
    status: ads.status
  }, (error) => console.error(error.message));
};

export const getRain = async (rainedUser: User, reward: number) => {
  socketServer.emitTo(rainedUser.socketid, socketEventNames.GetRain, {
    reward,
    balance: rainedUser.balance
  }, error => console.log("Socket => GetRain | Error:", error.message));
};