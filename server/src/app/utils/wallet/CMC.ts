import { CMCRestCaller } from "./CMCRestCaller";

export class CMCManager {
  private started = false;
  private cmcrc = new CMCRestCaller();
  private pollingIntervalSeconds = 60;
  private timeoutObj: any = undefined;
  private price = -1;

  public start(apiKey: string, pollingIntervalSeconds: number): void {
    if (this.started) {
      console.log("CRASHING ... The CMCManager must only be started 1 time.");
      return;
    }
    this.started = true;
    this.cmcrc.setApiKey(apiKey);
    this.pollingIntervalSeconds = pollingIntervalSeconds;
    this.price = -1;
    this.cmcrc.getVitaeInUSD((e: Error | null, price: number): void => {
      this.incommingPrice(e, price);
    });
  }

  public stop(): void {
    if (this.started) {
      if (this.timeoutObj) {
        clearTimeout(this.timeoutObj);
        this.timeoutObj = undefined;
      }
      this.started = false;
    }
  }

  public vitaePriceUSD(): number {
    return this.price;
  }

  private onTimeout(): void {
    this.timeoutObj = undefined;
    if (this.started) {
      this.cmcrc.getVitaeInUSD((e: Error | null, price: number): void => {
        this.incommingPrice(e, price);
      });
    }
  }

  private incommingPrice(e: Error | null, price: number): void {
    if (this.started) {
      if (!e) {
        this.price = price;
      }
      this.timeoutObj = setTimeout((): void => {
        this.onTimeout();
      }, 1000 * this.pollingIntervalSeconds);
    }
  }
}
