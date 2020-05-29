import * as Router from "koa-router";
import * as APIController from "../controllers";

export const apiRoutes = new Router()
  // Authentication
  .post("/register", APIController.registerController)
  .post("/login", APIController.loginController)

  // Referral
  .post("/ref/generate", APIController.generateReferral)
  .post("/ref/validate", APIController.validateReferral)

  // Profile
  .get("/user/:username", APIController.getProfileInfo)
  .put("/user/:username", APIController.updateProfileInfo)
  .post("/user/:username/avatar", APIController.uploadAvatar)
  .get("/user/:username/avatar", APIController.getAvatar);