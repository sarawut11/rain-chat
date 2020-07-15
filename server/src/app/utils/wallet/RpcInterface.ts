import axios from "axios";
import configs from "@configs";

class RPCInterface {
    url: string;
    authHeader: string;

    constructor() {
        this.url = `http://127.0.0.1:${configs.wallet.rpc_port}`;
        this.authHeader = "Basic " + Buffer.from(configs.wallet.rpc_user + ":" + configs.wallet.rpc_password).toString("base64");
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
        await this.call("walletpassphrase", [configs.wallet.pass_phrase, 5]);
        const res = await this.call("sendtoaddress", [address, amount]);
        return res;
    }

    getTransaction = async (txid) => {
        const res = await this.call("gettransaction", [txid]);
        return res;
    }
}

export const rpcInterface = new RPCInterface();