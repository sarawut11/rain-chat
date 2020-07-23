import { authVerify } from "@middlewares";
import { Ads, User } from "@models";
import { ServicesContext, RainContext } from "@context";
import { socketServer, socketEventNames, Channels } from "@sockets";

export const subscribeAdsReward = (token) => {
  const userInfo = authVerify(token);
  if (userInfo === false) {
    return;
  }
  const rainContext = RainContext.getInstance();
  const { id } = userInfo;
  rainContext.addUserToRainAds(id);
};

export const updateAdsStatus = async (ads: Ads) => {
  const { userService } = ServicesContext.getInstance();
  const user: User = await userService.findUserById(ads.userId);
  const reviewer = await userService.findUserById(ads.reviewer);

  // Notify Creator
  const data = {
    adsId: ads.id,
    username: user.username,
    status: ads.status,
    impressions: ads.impressions,
    reviewer
  };
  socketServer.emitTo(user.socketid, socketEventNames.UpdateAdsStatus, data,
    (error) => console.error(error.message));
  // Notify Moderators & Owners
  socketServer.broadcastChannel(Channels.OwnerChannel, socketEventNames.UpdateAdsStatus,
    data, (error) => console.error(error.message));
  socketServer.broadcastChannel(Channels.ModerChannel, socketEventNames.UpdateAdsStatus,
    data, (error) => console.error(error.message));
};

export const getRain = async (rainedUser: User, reward: number) => {
  socketServer.emitTo(rainedUser.socketid, socketEventNames.GetRain, {
    reward,
    balance: rainedUser.balance
  }, error => console.log("Socket => GetRain | Error:", error.message));
};