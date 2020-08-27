import { User } from "@models";
import { ServicesContext } from "@context";
import { getAllMessage } from "@sockets";
import { now, uploadFile, deleteFile } from "@utils";

export const initSocket = async (ctx, next) => {
  try {
    const { id: userId, username } = ctx.state.user;
    const { clientHomePageList } = ctx.request.body;
    const allMessage = await getAllMessage({ userId, clientHomePageList });
    ctx.body = {
      success: true,
      allMessage,
    };
  } catch (error) {
    ctx.body = {
      success: false,
      message: "Init Socket Failed"
    };
  }
};