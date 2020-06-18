import * as Router from "koa-router";
import * as APIController from "../controllers";

const auth = new Router()
  // Authentication
  .post("/register", APIController.registerUser)
  .post("/login", APIController.loginUser)
  .post("/token/validate", APIController.validateToken)
  .post("/ref/validate", APIController.validateReferral);

const api = new Router()
  // Profile
  .get("/user/:username", APIController.getProfileInfo)
  .put("/user/:username", APIController.updateProfileInfo)

  // Ads
  .get("/campaign/impcost", APIController.getCostPerImpression)

  .post("/campaign/pub/create", APIController.registerAds)
  .get("/campaign/pub/all", APIController.getAdsByUsername)
  .get("/campaign/pub/:adsId", APIController.getAds)
  .put("/campaign/pub/:adsId", APIController.updateAds)
  .delete("/campaign/pub/:adsId", APIController.deleteAds)
  .post("/campaign/pub/:adsId/request", APIController.requestAds)
  .post("/campaign/pub/:adsId/cancel", APIController.cancelAds)
  .post("/campaign/pub/:adsId/purchase", APIController.purchaseAds)

  .get("/campaign/mod/all", APIController.getAllAds)
  .post("/campaign/mod/:adsId/reject", APIController.rejectAds)
  .post("/campaign/mod/:adsId/approve", APIController.approveAds)

  .get("/campaign/static", APIController.getStaticAds)

  // Membership
  .get("/membership/price", APIController.getMembershipPrice)
  .get("/membership/role/users", APIController.getAllUsers)
  .post("/membership/role/update/moderator", APIController.setModerator)
  .post("/membership/role/upgrade/request", APIController.upgradeMembership)

  // Wallet
  .post("/walletnotify", APIController.walletNotify);

export const apiRoutes = new Router()
  .use("/api/v1", api.routes());

export const authRoutes = new Router()
  .use("/api/v1", auth.routes());