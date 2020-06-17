import { ServicesContext, CMCContext, RainContext } from "../context";
import { UserService } from "../services";
import configs from "@configs";
import * as moment from "moment";
import { User } from "../models";

export const getAllUsers = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const { role, name, email, username: searchUsername, searchString, page, count } = ctx.request.query;
    const users = await getUsersByRole(page, count, role, name, searchUsername, email, searchString);
    const totalCount = users.length === 0 ? 0 : users[0].totalCount;
    ctx.body = {
      success: true,
      totalCount,
      users
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const setModerator = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { username: assigneeUsername } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }
    const checkUser = await checkUserInfo(assigneeUsername);
    if (checkUser.success === false) {
      ctx.body = checkUser;
      return;
    }
    const { userInfo } = checkUser;
    await userService.updateMembership(userInfo.user_id, UserService.Role.MODERATOR);
    const user = await userService.findUserByUsername(username);
    ctx.body = {
      success: true,
      message: "Successfully Updated",
      userInfo: user[0],
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const getMembershipPrice = async (ctx, next) => {
  try {
    const price = _getMembershipPrice();
    ctx.body = {
      success: true,
      price
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const upgradeMembership = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { userService, transactionService } = ServicesContext.getInstance();

    const checkUser = await checkUserInfo(username);
    if (checkUser.success === false) {
      ctx.body = checkUser;
      return;
    }
    const { userInfo } = checkUser;
    if (userInfo.role === UserService.Role.OWNER || userInfo.role === UserService.Role.MODERATOR) {
      ctx.body = {
        success: false,
        message: "You can't upgrade your membership."
      };
    }

    const expectAmount = _getMembershipPrice();
    await transactionService.createMembershipRequest(userInfo.user_id, expectAmount);
    // Test call
    await confirmMembership(userInfo.user_id, expectAmount, moment().utc().unix());
    ctx.body = {
      success: true,
      message: "Your membership request is in pending."
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

const confirmMembership = async (userId, amount, confirmTime) => {
  const { userService, transactionService } = ServicesContext.getInstance();

  const RowDataPacket = await userService.findUserById(userId);
  const userInfo = RowDataPacket[0];

  // Update UserInfo & Transaction Info
  await userService.updateMembership(userId, UserService.Role.UPGRADED_USER);
  await transactionService.confirmMembershipRequest(userId, amount, confirmTime);

  // Revenue Share Model
  // ===== Company Share ===== //
  // 14.99 -> 4.99 | Company Revenue
  // ---------------------------------
  // 20% -----> Company Expenses
  // 30% -----> Owner Share
  // 25% -----> Moderator Share
  // 25% -----> Membership Users Share
  const companyRevenue = amount * configs.membership.revenue.company_revenue;
  const ownerShare = companyRevenue * configs.membership.revenue.owner_share;
  const moderatorShare = companyRevenue * configs.membership.revenue.moderator_share;
  const membersShare = companyRevenue * configs.membership.revenue.membership_share;

  await userService.shareRevenue(ownerShare, UserService.Role.OWNER);
  await userService.shareRevenue(moderatorShare, UserService.Role.MODERATOR);
  await userService.shareRevenue(membersShare, UserService.Role.UPGRADED_USER);

  // ====== Sponsor Share ===== //
  // 14.99 -> 5 | Sponsor Revenue
  // ---------------------------------
  // 50% -----> First Sponsor
  // 25% -----> Second Sponsor (first sponsor's sponsor)
  // 25% -----> Third Sponsor (second sponsor's sponsor)
  const sponsorRevenue = amount * configs.membership.revenue.sponsor_revenue;
  const firstSponsorShare = sponsorRevenue * configs.membership.revenue.sponsor_1_rate;
  const secondSponsorShare = sponsorRevenue * configs.membership.revenue.sponsor_2_rate;
  const thirdSponsorShare = sponsorRevenue * configs.membership.revenue.sponsor_3_rate;

  const firstSponsorId = userInfo.sponsor;
  const secondSponsorId = (await userService.findUserById(firstSponsorId))[0].sponsor;
  const thirdSponsorId = (await userService.findUserById(secondSponsorId))[0].sponsor;
  await userService.addBalance(firstSponsorId, firstSponsorShare);
  await userService.addBalance(secondSponsorId, secondSponsorShare);
  await userService.addBalance(thirdSponsorId, thirdSponsorShare);

  // ===== Rain Rest ===== //
  // 14.99 -> 5 | Rain Last 200 Users
  const restShare = amount - sponsorRevenue - companyRevenue;
  RainContext.getInstance().rainUsersByLastActivity(restShare);
};

const isOwner = (username): Promise<any> => new Promise(async (resolve, reject) => {
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

const checkUserInfo = (username, role?): Promise<any> => new Promise(async (resolve, reject) => {
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
  if (role === UserService.Role.FREE ||
    role === UserService.Role.MODERATOR ||
    role === UserService.Role.OWNER ||
    role === UserService.Role.UPGRADED_USER) {
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

const getUsersByRole = (page = 0, count = 10, role?, name?, username?, email?, searchString?): Promise<any> => new Promise(async (resolve, reject) => {
  if (count === 0) return ([]);
  const { userService } = ServicesContext.getInstance();
  const users = await userService.getUsers({
    start: page * count, count,
    role, name, username, email, searchString
  });
  resolve(users);
});

const _getMembershipPrice = () => {
  return configs.membership.price / CMCContext.getInstance().vitaePriceUSD();
};