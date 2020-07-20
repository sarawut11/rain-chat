import * as md5 from "md5";
import * as aws from "@utils";
import { ServicesContext } from "@context";
import { User } from "@models";
import { updateProfileInfoSocket } from "@sockets";

export const getProfileInfo = async (ctx, next) => {
  const { username } = ctx.params;
  const { userService } = ServicesContext.getInstance();

  const userInfo: User = await userService.findUserByUsername(username);
  if (userInfo === undefined) {
    console.log(`Profile Info => Failed | Invalid username:${username}`);
    ctx.body = {
      success: false,
      message: "Username does not exist."
    };
  } else {
    const { id, name, email, balance, intro, avatar, refcode } = userInfo;
    ctx.body = {
      success: true,
      userInfo: {
        name,
        email,
        username,
        userId: id,
        balance,
        intro,
        avatar,
        referral: refcode
      },
    };
  }
};

export const updateProfileInfo = async (ctx, next) => {
  try {
    const { username } = ctx.params;
    const avatar = ctx.request.files.avatar;
    const { name, intro } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const fileName = `avatar/avatar-${username}.png`;
    let avatarUrl: string;
    if (avatar !== undefined) {
      const { url } = await aws.uploadFile({
        fileName,
        filePath: avatar.path,
        fileType: avatar.type,
      });
      avatarUrl = url;
    } else {
      avatarUrl = undefined;
    }

    await userService.setUserInfo(username, { name, intro, avatar: avatarUrl });
    const updatedUser = await userService.findUserByUsername(username);
    updateProfileInfoSocket(updatedUser);
    console.log(`Profile Update => Success | Username:${username}`);

    ctx.body = {
      success: true,
      message: "Profile updated successfully.",
      userInfo: updatedUser,
    };
  } catch (error) {
    console.log(`Profile Update => Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const addWithdrawAddress = async (ctx, next) => {
  try {
    const { username, id: userId } = ctx.state.user;
    const { walletAddress, label } = ctx.request.body;
    const { withdrawAddressService } = ServicesContext.getInstance();

    // Save withdrawal addresses
    await withdrawAddressService.addWithdrawAddress(userId, walletAddress, label);
    const addresses = await withdrawAddressService.getAddressByUserid(userId);
    console.log(`Withdraw Address => Add Success | Username:${username}, Address:${walletAddress}`);
    ctx.body = {
      success: true,
      message: "Success",
      addresses
    };
  } catch (error) {
    console.log(`Withdraw Address => Add Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const getWithdrawAddresses = async (ctx, next) => {
  try {
    const { id: userId } = ctx.state.user;
    const { withdrawAddressService } = ServicesContext.getInstance();

    const addresses = await withdrawAddressService.getAddressByUserid(userId);
    ctx.body = {
      success: true,
      message: "Success",
      addresses
    };
  } catch (error) {
    console.log(`Withdraw Address => Get Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const updatePassword = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const { oldPassword, newPassword } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const userInfo: User = await userService.findUserByUsername(username);
    if (userInfo === undefined) {
      console.log("Update Password => Failed | Unknown user");
      ctx.body = {
        success: false,
        message: "Unknown user.",
      };
      return;
    }

    if (md5(oldPassword) !== userInfo.password) {
      console.log("Update Password => Failed | Wrong password");
      ctx.body = {
        success: false,
        message: "Wrong password.",
      };
      return;
    }

    await userService.updatePassword(userInfo.id, md5(newPassword));
    console.log("Update Password => Success | username:", username);

    ctx.body = {
      success: true,
      message: "Password updated."
    };
  } catch (error) {
    console.log(`Update password => Failed | Error:${error.message}`);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};