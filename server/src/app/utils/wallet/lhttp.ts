import { IncomingMessage } from "http";
import { StringDecoder } from "string_decoder";

/**
 * On a client read len bytes from the server's HTTP response, or on a server read len bytes from the client's HTTP request.
 * Or read all the way to the end of the reponse/request data by passing 0 for the len parameter.
 * If chan.setEncoding() has been called to set a string encoding for the request/response then lhttp_read() won't work correctly.
 * If an encoding's given then it's used to provide the data read as a string, otherwise it's provided as an array of node.js Buffer objects.
 * Note that the length is in bytes as distinct from string characters.
 * If the requested length has already been read from the network then doneCallback() isn't called, instead the data's returned immediately.
 * Otherwise lhttp_read() returns null and doneCallback()'s called later to indicate completeion.
 * If doneCallback() is called and something went wrong then the e parameter contains an Error object.
 * If e is null, then the data read is in doneCallback()'s data parameter, and msgEnded is set to true if lhttp_read() detected the end of the message.
 * If the message ends before the requested length is read then lhttp_read() returns less than the requested length.
 * Check the length of the data returned to watch for this.
 * Note that the request/response has a boolean property complete which will be true if a complete HTTP message has been received successfully.
 *
 * @param {IncomingMessage} chan Where to read from (an HTTP response object on a client, or an HTTP request object on a server).
 * @param {number} len The number of bytes to read, or 0 to read all the way to the end of the message. (Note, not the number of string characters).
 * @param {(BufferEncoding | null)} encoding If an encoding's given it's used to return the data as a string, otherwise it's returned as an array of node.js Buffer objects.
 * @param {((e : Error | null, msgEnded : boolean, data : Buffer[] | string) => any)} doneCallback The function to be called when the read completes if lhttp_read() returned null.
 * @returns {(Buffer[] | string | null)} If the requested length has already been read from the network then return the read data, otherwise return null.
 */

export function lhttp_read(
  chan: IncomingMessage,
  len: number,
  encoding: BufferEncoding | null,
  doneCallback: (
    e: Error | null,
    msgEnded: boolean,
    data: Buffer[] | string
  ) => any
): Buffer[] | string | null {
  const chunks: Buffer[] = [];
  let str = "";
  const originalLen = len;
  if (len <= 0) {
    len = Number.MAX_SAFE_INTEGER;
  }
  const decoder = encoding ? new StringDecoder(encoding) : undefined;
  let done = false;
  chan.on("readable", onReadable);
  if (receive()) {
    chan.off("readable", onReadable);
    return tidyUpAndGetData();
  } else {
    chan.on("error", onError);
    chan.on("aborted", onAborted);
    chan.on("close", onClose);
    chan.on("end", onEnd);
    return undefined;
  }

  function onReadable() {
    if (!done && receive()) {
      complete(undefined, false);
    }
  }

  function onError(e: Error): void {
    if (!done) {
      complete(e, false);
    }
  }

  function onAborted(): void {
    if (!done) {
      complete(
        new Error("lhttp_read() aborted before complete length read."),
        false
      );
    }
  }

  function onClose(): void {
    if (!done) {
      complete(
        new Error("lhttp_read() closed before complete length read."),
        false
      );
    }
  }

  function onEnd(): void {
    if (!done) {
      complete(
        originalLen > 0 && len > 0
          ? new Error("lhttp_read() ended before complete length read.")
          : undefined,
        true
      );
    }
  }

  function receive(): boolean {
    while (len) {
      let rdLen = chan.readableLength;
      if (rdLen < 8) {
        rdLen = 8;
      }
      if (rdLen > len) {
        rdLen = len;
      }
      const cnk = chan.read(rdLen);
      if (!cnk) {
        return false;
      }
      len -= cnk.length;
      if (encoding) {
        str += decoder.write(cnk);
      } else {
        chunks.push(cnk);
      }
    }
    return true;
  }

  function complete(e: Error | null, msgEnded: boolean): void {
    chan.off("readable", onReadable);
    chan.off("error", onError);
    chan.off("aborted", onAborted);
    chan.off("close", onClose);
    chan.off("end", onEnd);
    doneCallback(e, msgEnded, tidyUpAndGetData());
  }

  function tidyUpAndGetData(): Buffer[] | string {
    done = true;
    if (encoding) {
      str += decoder.end();
      return str;
    } else {
      return chunks;
    }
  }
}
