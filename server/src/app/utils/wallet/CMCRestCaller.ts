import { IncomingMessage } from "http";
import * as https from "https";
import { RequestOptions } from "https";
import { lhttp_read } from "./lhttp";

export class CMCRestCaller {
  private apiKey: string = "";

  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  public getVitaeInUSD(
    callback: (e: Error | null, price: number) => any
  ): void {
    this.callCMC(
      "/v1/cryptocurrency/quotes/latest",
      "id=3063",
      (e: Error | null, resultStr: string | null): void => {
        if (e) {
          callback(e, 0);
        } else if (!resultStr) {
          callback(
            new Error(
              "The CMC API /v1/cryptocurrency/quotes/latest returned no data at all."
            ),
            0
          );
        } else {
          let errorCode = Number.MIN_SAFE_INTEGER;
          let errorMessage: string | null;
          const result = JSON.parse(resultStr);
          const status = result.status;
          if (status) {
            errorCode = status.error_code;
            errorMessage = status.error_message;
          }
          if (errorCode === Number.MIN_SAFE_INTEGER) {
            callback(new Error("CMC Rest API ERROR : Unknown error."), 0);
          } else if (errorCode) {
            callback(
              new Error(`CMC Rest API ERROR : ${errorCode} : ${errorMessage}`),
              0
            );
          } else if (
            result.data &&
            result.data["3063"] &&
            result.data["3063"].quote &&
            result.data["3063"].quote.USD
          ) {
            callback(undefined, result.data["3063"].quote.USD.price);
          } else {
            callback(
              new Error(
                "CMC Rest API ERROR : Failed to find price in JSON returned by CMC."
              ),
              0
            );
          }
        }
      }
    );
  }

  private callCMC(
    uri: string,
    urlParams: string,
    callback: (e: Error | null, result: string | null) => any
  ): void {
    let done = false;
    const options: RequestOptions = {
      headers: {
        "X-CMC_PRO_API_KEY": this.apiKey,
        Accept: "application/json"
      }
    };
    const complete = (e: Error | null, result: string | null): void => {
      if (!done) {
        done = true;
        callback(e, result);
      }
    };
    const req = https.get(
      `https://pro-api.coinmarketcap.com${uri}?${urlParams}`,
      options,
      (res: IncomingMessage): void => {
        const immediateResult = lhttp_read(
          res,
          0,
          "utf8",
          (e: Error | null, _: boolean, data: string | Buffer[]): void => {
            complete(e, data as string | null);
          }
        );
        if (immediateResult) {
          complete(undefined, immediateResult as string);
        }
      }
    );
    req.on("error", (e: Error): void => {
      complete(e, undefined);
    });
  }
}
