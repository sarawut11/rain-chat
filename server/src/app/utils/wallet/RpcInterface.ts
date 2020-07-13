import axios from "axios";
import configs from "@configs";

class RPCInterface {
    url: string;
    authHeader: string;

    constructor() {
        this.url = `http://127.0.0.1:${configs.wallet.rpc_port}`;
        this.authHeader = "Basic " + Buffer.from(configs.wallet.rpc_user + ":" + configs.wallet.rpc_password).toString("base64");
    }

    // randomString = length => {
    //     let res = "";
    //     const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    //     for (let i = 0; i < length; i++) {
    //         res += characters.charAt(Math.floor(Math.random() * characters.length));
    //     }
    //     return res;
    // }

    call = (method, params): Promise<any> => {
        return new Promise(resolve => {
            // const nonce = 'X' + this.randomString(32);
            const postData = JSON.stringify({
                method,
                params,
                id: 1
              });
            // const data = '{ "jsonrpc" : "1.0", "id" : "' + nonce + '", "method" : "' + method + '", "params" : ' + JSON.stringify(params) + ' }';
            axios.post(this.url, postData, {
                headers: {
                    "content-type": "application/json",
                    "Authorization": this.authHeader
                }
            }).then(res => {
                resolve(res.data);
            }).catch(err => {
                console.log("RPC Call Error: ", err);
            });
        });
    }

    getNewAddress = async () => {
        const res = await this.call("getnewaddress", []);
        return res;
    }

    validateAddress = async (address) => {
        const res = await this.call("validateaddress", [address]);
        return res;
    }

    sendToAddress = async (address, amount) => {
        const res = await this.call("sendtoaddress", [address, amount]);
        return res;
    }

    getTransaction = async (txid) => {
        const res = await this.call("gettransaction", [txid]);
        return res;
    }
}

export const rpcInterface = new RPCInterface();