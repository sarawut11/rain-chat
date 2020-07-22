import * as moment from "moment";
import { User } from "@models";
import { ServicesContext } from "@context";
import { updateBalanceSocket } from "@sockets";

const VITAE_POST_TIME = Number(process.env.VITAE_POST_TIME);
const COMPANY_USERID = Number(process.env.COMPANY_USERID);

export const now = (): number => {
  return moment().utc().unix();
};

export const nowDate = (): moment.Moment => {
  return moment().utc();
};

export const isVitaePostEnabled = (user: User): boolean => {
  const enabled: boolean = (now() - VITAE_POST_TIME / 1000) >= user.lastVitaePostTime;
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
    // Add Inner Transactions
    const users: User[] = await userService.findUsersByRole(role);
    const userIds: number[] = [];
    users.forEach(user => userIds.push(user.id));
    await innerTranService.addTrans(userIds, amount, type);
    // Update User Balance
    await userService.shareRevenue(amount, User.ROLE.OWNER);
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