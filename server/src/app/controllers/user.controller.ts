import { ServicesContext } from "../context";

export const getProfileInfo = async (ctx, next) => {
  const { userService } = ServicesContext.getInstance();
  const { username } = ctx.params;

  const res = await userService.findUserByUsername(username);
  if (res.length > 0) {
    const { username, name, email, balance, intro, avatar, userid } = res[0];
    ctx.body = {
      success: true,
      userInfo: {
        name,
        email,
        username,
        balance,
        intro,
        avatar,
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
  const { userService } = ServicesContext.getInstance();

  const { username } = ctx.params;
  const { name, intro } = ctx.request.body;

  try {
    await userService.setUserInfo(username, { name, intro });
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