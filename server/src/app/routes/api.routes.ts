import * as Router from "koa-router";

import {
  loginController,
  registerController,
  generateReferral,
  validateReferral,
} from "../controllers";

export const apiRoutes = new Router()
  // Authentication
  .post("/register", registerController)
  .post("/login", loginController)

  // Referral
  .post("/ref/generate", generateReferral)
  .post("/ref/validate", validateReferral);
