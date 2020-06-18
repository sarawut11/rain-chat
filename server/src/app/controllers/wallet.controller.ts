import { rpcInterface } from "../utils/wallet/RpcInterface";
import { ServicesContext } from "../context";

export const walletNotify = async (ctx, next) => {
  try {
    const { txid } = ctx.request.body;
    const { transactionService } = ServicesContext.getInstance();

    const txInfo = await rpcInterface.getTransaction(txid);
    console.log("Tx Info: ", txInfo);
    // ====== Update Transaction Info =====
    // amount: txInfo.amount
    // confirmations: txInfo.confirmations
    // category: txInfo.details[0].category => "send" | "receive"
    // receiveAddress: txInfo.details[0].address when category == "receive"
    // We don't need to consider about send category
    // Find who owns the receive address
    // Check transaction table if the owner requested purchase
    // Get purchase type, amount from the table
    // Compare purchase amount and actual amount
    // If actual amount >= purchase amount, update db and transaction table according to the purchase type
    // If actual amount < purchase amount, update proper transaction table record to show "insufficient tokens, contact support" in frontend

    // ===== Confrim Membership Transaction =====
    // Copy role.controller.ts -> confirmMembership func body

    // ===== Confrim Ads Transaction =====
    // Copy ads.mod.controller.ts -> confirmAds func body
    // Ads Purchase Status :
    //  - PendingPurchase
    //  - PendingConfirm
    //  - Paid

    ctx.body = {
      success: true,
      message: "Success",
    };
  } catch (error) {
    console.error(error.message);
    ctx.body = {
      success: false,
      message: "Failed"
    };
  }
};