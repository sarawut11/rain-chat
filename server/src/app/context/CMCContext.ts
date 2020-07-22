import { CMCManager } from "@utils";

const CMC_API_KEY = process.env.CMC_API_KEY;
const CMC_POLLING_INTERVAL = Number(process.env.CMC_POLLING_INTERVAL);

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
    this.CMC.start(CMC_API_KEY, CMC_POLLING_INTERVAL);
  }

  public vitaePriceUSD(): number {
    return this.CMC.vitaePriceUSD();
    // return 1; // placeholder : 1 vitae === 1 usd
  }
}
