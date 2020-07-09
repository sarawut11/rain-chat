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
  .post("/user/wallet-address", APIController.saveWalletAddress)
  .get("/user/otp/request", APIController.generateOTP)
  .post("/user/otp/verify", APIController.verifyOTP)

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

  // Admin Dashboard
  .get("/admin/home", APIController.getHomeAnalytics)
  .get("/admin/ads", APIController.getAdsAnalytics)

  .get("/admin/moders", APIController.getModsAnalytics)
  .get("/admin/moders/usernamelist", APIController.getUsernamelist)
  .post("/admin/moders/set", APIController.updateModers)
  .post("/admin/moders/cancel", APIController.cancelModer)

  .get("/admin/chat", APIController.getChatAnalytics)

  .get("/admin/financial", APIController.getFinancialAnalytics)

  // Wallet
  .get("/wallet/company-rain-address", APIController.getCompanyRainAddress)
  .post("/wallet/withdraw", APIController.walletWithdraw)
  .post("/walletnotify", APIController.walletNotify);

export const apiRoutes = new Router()
  .use("/api/v1", api.routes());

export const authRoutes = new Router()
  .use("/api/v1", auth.routes());