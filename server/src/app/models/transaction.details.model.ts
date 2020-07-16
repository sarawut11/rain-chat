export class TransactionDetail {
  // Ads Purchase
  adsId: number;
  impressions: number;
  costPerImp: number;
  adsType: number;

  // Send Vitae Purchase
  toAddress: string;
  amount: number;
  time: number;

  constructor(data) {
    this.adsId = data.adsId;
    this.impressions = data.impressions;
    this.costPerImp = data.costPerImp;
    this.adsType = data.adsType;

    this.toAddress = data.toAddress;
    this.amount = data.amount;
    this.time = data.time;
  }
}