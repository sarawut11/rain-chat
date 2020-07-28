import { CMCContext } from "@context";

export const usdToVitae = (usdPrice: number) => {
  return usdPrice / CMCContext.getInstance().vitaePriceUSD();
};

export const vitaeToUsd = (vitaePrice: number) => {
  return vitaePrice * CMCContext.getInstance().vitaePriceUSD();
};