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
  .post("/campaign/:username/create", APIController.registerAds)
  .get("/campaign/:username", APIController.getAdsByUsername)
  .get("/campaign/:username/:id", APIController.getAds)
  .put("/campaign/:username/:id", APIController.updateAds)
  .delete("/campaign/:username/:id", APIController.deleteAds)
  .post("/campaign/:username/:id/request", APIController.requestAds)
  .post("/campaign/:username/:id/cancel", APIController.cancelAds)

  .get("/campaign/mod/:username/all", APIController.getAllAds)
  .post("/campaign/mod/:username/reject", APIController.rejectAds)
  .post("/campaign/mod/:username/approve", APIController.approveAds);