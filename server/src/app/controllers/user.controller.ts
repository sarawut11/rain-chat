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
  try {
    const { username } = ctx.params;
    const avatar = ctx.request.files.avatar;
    const { name, intro } = ctx.request.body;
    const { userService } = ServicesContext.getInstance();

    const fileName = `avatar/avatar-${username}`;
    const { url } = await aws.uploadFile({
      fileName: fileName,
      filePath: avatar.path,
      fileType: avatar.type,
    });

    await userService.setUserInfo(username, { name, intro, avatar: url });
    const userInfo = {
      username,
      avatar: url,
      name,
      intro,
    };
    socketServer.broadcast("updateProfileInfo", { userInfo }, error => console.log(error.message));
    ctx.body = {
      success: true,
      message: "Profile updated successfully.",
      userInfo,
    };
  } catch (error) {
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};