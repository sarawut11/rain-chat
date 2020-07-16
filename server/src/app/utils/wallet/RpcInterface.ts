import axios from "axios";

const WALLET_RPC_USER = process.env.WALLET_RPC_USER;
const WALLET_RPC_PASS = process.env.WALLET_RPC_PASS;
const WALLET_RPC_PASS_PHRASE = process.env.WALLET_RPC_PASS_PHRASE;
const WALLET_RPC_PORT = Number(process.env.WALLET_RPC_PORT);


class RPCInterface {
    url: string;
    authHeader: string;

    constructor() {
        this.url = `http://127.0.0.1:${WALLET_RPC_PORT}`;
        this.authHeader = "Basic " + Buffer.from(WALLET_RPC_USER + ":" + WALLET_RPC_PASS).toString("base64");
    }

    call = (method, params): Promise<any> => {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                method,
                params,
                id: 1
            });
            axios.post(this.url, postData, {
                headers: {
                    "content-type": "application/json",
                    "Authorization": this.authHeader
                }
            }).then(res => {
                resolve(res.data.result);
            }).catch(err => {
                console.log("RPC Call Error: ", err.response.data.error);
                reject(err.response.data.error);
            });
        });
    }

    getNewAddress = async () => {
        const res = await this.call("getnewaddress", []);
        return res;
    }

    validateAddress = async (address) => {
        const res = await this.call("validateaddress", [address]);
        return res.isvalid;
    }

    sendToAddress = async (address, amount) => {
        await this.call("walletpassphrase", [WALLET_RPC_PASS_PHRASE, 5]);
        const res = await this.call("sendtoaddress", [address, amount]);
        return res;
    }

    getTransaction = async (txid) => {
        const res = await this.call("gettransaction", [txid]);
        return res;
    }

    getBalance = async (): Promise<number> => {
        const res = await this.call("getbalance", []);
        return res;
    }
}

export const rpcInterface = new RPCInterface();