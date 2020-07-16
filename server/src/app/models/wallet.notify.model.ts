import { WalletNotifyDetail } from "./wallet.notify.detail.model";

export class WalletNotify {
  amount: number;
  confirmations: number;
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