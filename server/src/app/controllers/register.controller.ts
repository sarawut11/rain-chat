import * as md5 from "md5";
import { ServicesContext } from "../context";

export const registerController = async (ctx, next) => {
  const { userService } = ServicesContext.getInstance();

  const { name, password } = ctx.request.body;
  const result = await userService.findDataByName(name);
  if (result.length) {
    ctx.body = {
      success: false,
      message: "Username already exists",
    };
  } else {
    ctx.body = {
      success: true,
      message: "Registration success!",
    };
    console.log("Registration success");
    userService.insertData([name, md5(password)]);
  }
};
