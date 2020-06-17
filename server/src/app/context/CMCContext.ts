import { CMCManager } from "../utils/wallet/CMC";
import configs from "@configs";

export class CMCContext {
  static instance: CMCContext;
  public CMC: CMCManager;

  static getInstance(): CMCContext {
    if (!CMCContext.instance) {
      CMCContext.instance = new CMCContext();
    }
    return CMCContext.instance;
  }

  constructor() {
    this.CMC = new CMCManager();
    // this.CMC.start(configs.cmc.api_key, configs.cmc.polling_interval_seconds);
  }

  public vitaePriceUSD(): number {
    // return this.CMC.vitaePriceUSD();
    return 1; // placeholder : 1 vitae === 1 usd
  }
}
