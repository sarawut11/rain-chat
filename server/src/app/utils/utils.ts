import * as moment from "moment";
import { User, Setting } from "@models";
import { ServicesContext } from "@context";
import { updateBalanceSocket } from "@sockets";

const COMPANY_USERID = Number(process.env.COMPANY_USERID);

export const now = (): number => {
  return moment().utc().unix();
};

export const nowDate = (): moment.Moment => {
  return moment().utc();
};

export const isVitaePostEnabled = async (user: User): Promise<boolean> => {
  const { settingService } = ServicesContext.getInstance();
  const vitaePostTime: number = await settingService.getSettingValue(Setting.KEY.VITAE_POST_TIME);
  const enabled: boolean = (now() - vitaePostTime / 1000) >= user.lastVitaePostTime;
  return enabled;
};

export const isOwner = (username): Promise<{
  success: boolean,
  message?: string,
  userInfo?: User
}> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const userInfo: User = await userService.findUserByUsername(username);
  if (userInfo === undefined) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
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


export const checkUserInfo = (username, role?): Promise<{
  success: boolean,
  message?: string,
  userInfo?: User
}> => new Promise(async (resolve, reject) => {
  const { userService } = ServicesContext.getInstance();
  const userInfo: User = await userService.findUserByUsername(username);
  if (userInfo === undefined) {
    resolve({
      success: false,
      message: "Invalid Username."
    });
    return;
  }
  if (userInfo.id === 1) { // Default Admin
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
    await innerTranService.addTrans([COMPANY_USERID], amount, type);
  }
  else {
    const users: User[] = await userService.findUsersByRole(role);
    if (users.length === 0) return;

    // Add Inner Transactions
    const userIds: number[] = [];
    users.forEach(user => userIds.push(user.id));
    const eachShare = amount / users.length;
    await innerTranService.addTrans(userIds, eachShare, type);
    // Update User Balance
    await userService.shareRevenue(amount, role);
    const updatedUsers = await userService.findUsersByRole(role);
    updatedUsers.forEach(user => updateBalanceSocket(user));
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

export const roundPrice = (price: number): number => {
  return Number((price + 0.00000001).toFixed(8));
};

export const getTranExpireIn = async (requestedTime: number): Promise<number> => {
  const { settingService } = ServicesContext.getInstance();
  const tranExpire: number = await settingService.getSettingValue(Setting.KEY.TRANSACTION_REQUEST_EXPIRE);
  const expireIn = requestedTime * 1000 + tranExpire - now() * 1000;
  return expireIn;
};

export const getAdsIdFromTran = (tranDetails: string): number => {
  const adsId = tranDetails === "" ? undefined : JSON.parse(tranDetails).adsId;
  return Number(adsId);
};