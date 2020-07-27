import { ServicesContext, RainContext } from "@context";
import { isOwner } from "@utils";

export const getPlatformSettings = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const { settingService } = ServicesContext.getInstance();
    const settings = await settingService.getAllSettings();

    ctx.body = {
      success: true,
      settings,
    };
  } catch (error) {
    console.log("Platform Setting => Get Failed | Error:", error.message);
    ctx.body = {
      success: false,
      message: "Failed. Something went wrong."
    };
  }
};

export const updatePlatformSetting = async (ctx, next) => {
  try {
    const { username } = ctx.state.user;
    const checkRole = await isOwner(username);
    if (checkRole.success === false) {
      ctx.body = checkRole;
      return;
    }

    const newSettings = ctx.request.body;
    const { settingService } = ServicesContext.getInstance();
    await Promise.all(Object.keys(newSettings).map(key => {
      return settingService.updateSetting(key, newSettings[key]);
    }));
    await RainContext.getInstance().updateSettings();

    ctx.body = {
      success: true,
      message: "Platform setting updated."
    };
  } catch (error) {
    console.log("Platform Setting => Update Failed | Error:", error.message);
    ctx.body = {
      success: false,
      message: "Failed. Something went wrong."
    };
  }
};