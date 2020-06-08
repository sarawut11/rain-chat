import { ServicesContext } from "../context";

export const getAllUsers = async (ctx, next) => {
  try {
    const { userService } = ServicesContext.getInstance();
    // ctx.status.user
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: error.message
    };
  }
};