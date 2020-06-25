import { ServicesContext } from "../context";
import * as moment from "moment";
import configs from "@configs";
import { User } from "../models";

export const isVitaePostEnabled = (user: User): boolean => {
  const enabled: boolean = (moment().utc().unix() - configs.rain.vitae_post_time / 1000) >= user.lastVitaePostTime;
  return enabled;
};

export const isOwner = (username): Promise<any> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const RowDataPacket: User[] = await userService.getUserInfoByUsername(username);
  if (RowDataPacket.length <= 0) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
  const userInfo = RowDataPacket[0];
  if (userInfo.role !== User.ROLE.OWNER) {
    resolve({
      success: false,
      message: "You are not a Owner."
    });
    return;
  }
  resolve({
    success: true,
    userInfo,
  });
});


export const checkUserInfo = (username, role?): Promise<any> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const RowDataPacket = await userService.getUserInfoByUsername(username);
  if (RowDataPacket.length <= 0) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
  const userInfo = RowDataPacket[0];
  if (userInfo.user_id === 1) { // Default Admin
    resolve({
      success: false,
      message: "Can't modify this user's info"
    });
  }
  if (role === undefined) {
    resolve({
      success: true,
      userInfo,
    });
  }
  if (role === User.ROLE.FREE ||
    role === User.ROLE.MODERATOR ||
    role === User.ROLE.OWNER ||
    role === User.ROLE.UPGRADED_USER) {
    resolve({
      success: true,
      userInfo,
    });
  } else {
    resolve({
      success: false,
      message: "Invalid Role."
    });
  }
});
