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

  // Ads
  .post("/ads/:username/create", APIController.registerAds)
  .get("/ads/:username", APIController.getAdsByUsername)
  .get("/ads/:username/:id", APIController.getAds)
  .put("/ads/:username/:id", APIController.updateAds)
  .delete("/ads/:username/:id", APIController.deleteAds)
  .post("/ads/:username/:id/request", APIController.requestAds);