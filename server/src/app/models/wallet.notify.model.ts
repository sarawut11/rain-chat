import { WalletNotifyDetail } from "@models";

export class WalletNotify {
  amount: number;
  confirmations: number;  // 0: Pending, 1: Confirmed
  bcconfirmations: number;
  blockhash: string;
  blockindex: number;
  blocktime: number;
  txid: string;
  walletconflicts: [];
  time: number;
  timereceived: number;
  details: WalletNotifyDetail[];
}