import * as Router from "koa-router";

import { loginController, registerController } from "../controllers";

export const apiRoutes = new Router()
  .post("/register", registerController) // Register
  .post("/login", loginController); // Login
