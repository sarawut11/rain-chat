import * as md5 from "md5";
import { ServicesContext } from "../context";

export const registerController = async (ctx, next) => {
  const { userService } = ServicesContext.getInstance();

  const { name, email, username, password } = ctx.request.body;
  if (username === "" || password === "" || name === "" || email === "") {
    ctx.body = {
      success: false,
      message: "Username or password cannot be empty",
    };
    return;
  }
  const result = await userService.findDataByUsername(username);
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
    userService.insertData([name, email, username, md5(password)]);
  }
};
