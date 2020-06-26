import { ServicesContext } from "../context";
import * as moment from "moment";
import configs from "@configs";
import { User, InnerTransaction } from "../models";

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

export const shareRevenue = async (amount: number, role: string, type: number) => {
  const { userService, innerTranService } = ServicesContext.getInstance();
  if (role === User.ROLE.COMPANY) {
    // Deposit Company Wallet directly later ...
    // Add Inner Transactions
    await innerTranService.addTrans([configs.companyUserId], amount, type);
  }
  else {
    // Add Inner Transactions
    const users: User[] = await userService.findUsersByRole(role);
    const userIds = [];
    users.forEach(user => userIds.push(user.id));
    await innerTranService.addTrans(userIds, amount, type);
    // Update User Balance
    await userService.shareRevenue(amount, User.ROLE.OWNER);
  }
};

export const getInArraySQL = array => {
  let res = "";
  array.forEach(element => {
    if (element !== null && element !== undefined && element !== "") {
      res += "'" + element.toString() + "',";
    }
  });
  res = res.substring(0, res.length - 1);
  return res;
};