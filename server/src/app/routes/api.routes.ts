import * as Router from "koa-router";
import * as APIController from "../controllers";

const auth = new Router()
  // Authentication
  .post("/register", APIController.registerUser)
  .post("/login", APIController.loginUser)
  .post("/token/validate", APIController.validateToken)
  .post("/ref/validate", APIController.validateReferral)
  .post("/walletnotify", APIController.walletNotify);

const api = new Router()
  // Profile
  .get("/user/:username", APIController.getProfileInfo)
  .put("/user/:username", APIController.updateProfileInfo)
  .post("/user/withdraw-address/add", APIController.addWithdrawAddress)
  .get("/user/withdraw-address", APIController.getWithdrawAddresses)
  .get("/user/otp/request", APIController.generateOTP)
  .post("/user/otp/verify", APIController.verifyOTP)

  // Rain
  .post("/rain/send-vitae/balance", APIController.rainFromBalance)

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

  // Expense
  .get("/expense/get-all", APIController.getAllExpenses)
  .post("/expense/create", APIController.createExpenseRequest)
  .post("/expense/approve", APIController.approveExpense)
  .post("/expense/reject", APIController.rejectExpense)
  .post("/expense/withdraw", APIController.withdrawExpense)

  // Admin Dashboard
  .get("/admin/home", APIController.getHomeAnalytics)
  .get("/admin/ads", APIController.getAdsAnalytics)

  .get("/admin/moders", APIController.getModsAnalytics)
  .get("/admin/moders/usernamelist", APIController.getUsernamelist)
  .post("/admin/moders/set", APIController.updateModers)
  .post("/admin/moders/cancel", APIController.cancelModer)

  .get("/admin/chat", APIController.getChatAnalytics)

  .get("/admin/financial", APIController.getFinancialAnalytics)
  .get("/admin/wallet", APIController.getWalletAnalytics)

  // Wallet
  .get("/wallet/company-rain-address", APIController.getCompanyRainAddress)
  .post("/wallet/withdraw", APIController.walletWithdraw);

export const apiRoutes = new Router()
  .use("/api/v1", api.routes());

export const authRoutes = new Router()
  .use("/api/v1", auth.routes());