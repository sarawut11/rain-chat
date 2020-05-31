import * as mime from "mime-types";
import * as aws from "../utils/aws";
import { ServicesContext } from "../context";
import { socketServer } from "../socket/app.socket";

export const getProfileInfo = async (ctx, next) => {
  const { username } = ctx.params;
  const { userService } = ServicesContext.getInstance();

  const res = await userService.findUserByUsername(username);
  if (res.length > 0) {
    const { id, username, name, email, balance, intro, avatar, socketId, userid } = res[0];
    ctx.body = {
      success: true,
      userInfo: {
        name,
        email,
        username,
        user_id: id,
        balance,
        intro,
        avatar,
        socketId,
        referral: userid
      },
    };
  } else {
    ctx.body = {
      success: false,
      message: "Username does not exist."
    };
  }
};

export const updateProfileInfo = async (ctx, next) => {

  const { username } = ctx.params;
  const { name, intro } = ctx.request.body;
  const { userService } = ServicesContext.getInstance();

  try {
    await userService.setUserInfo(username, { name, intro });
    socketServer.broadcast("updateProfileInfo", {
      userInfo: {
        username,
        name,
        intro,
      }
    }, error => console.log(error.message));
    ctx.body = {
      success: true,
      message: "Profile updated successfully."
    };
  } catch (error) {
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};

export const uploadAvatar = async (ctx, next) => {
  try {
    const { username } = ctx.params;
    const { userService } = ServicesContext.getInstance();

    const avatar = ctx.request.files.avatar;
    const fileName = `avatar-${username}.${mime.extension(avatar.type)}`;

    const { url } = await aws.uploadFile({
      fileName: fileName,
      filePath: avatar.path,
      fileType: avatar.type,
    });
    await userService.setAvatar(username, url);
    socketServer.broadcast("updateAvatar", {
      userInfo: {
        username,
        avatar: url,
      }
    }, error => console.log(error.message));
    ctx.body = {
      success: true,
      message: "Successfully Uploaded",
      avatar: url
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Upload Failed",
    };
  }
};

export const getAvatar = async (ctx, next) => {
  try {
    const { username } = ctx.params;
    const { userService } = ServicesContext.getInstance();
    const { avatar } = (await userService.getUserInfoByUsername(username))[0];
    ctx.body = {
      success: true,
      avatar: avatar
    };
  } catch (error) {
    console.log(error.message);
    ctx.body = {
      success: false,
      message: "Fetching Avatar Failed."
    };
  }
};