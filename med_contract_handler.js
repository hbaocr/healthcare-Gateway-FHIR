var service_acc = require("./accountInfo");
var MedcontractInfo = require("./contractInfo");
var sigUtil = require('eth-sig-util');
var Web3 = require('web3');
var abiDecoder = require('abi-decoder');
// https://web3js.readthedocs.io/en/1.0/web3.html#value
// becasue The HTTP provider is deprecated, as it won’t work for subscriptions ( listen event from smartcontract)
// need to enable websocket provider api to support app listen from smartcontract
class DappHandler
{   
    constructor(){

    }
    setup_web3_websocket(web3){
        this._gasLimit = MedcontractInfo._gasLimit;
        this._gasPrice = MedcontractInfo._gasPrice;
        if (web3) {
            this.web3 = web3; //use external web3
        } else {
            var web3 = new Web3(new Web3.providers.WebsocketProvider(service_acc.wshost));
            var privateKey = sigUtil.normalize(service_acc.prvK);
            //https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#wallet
            var account = web3.eth.accounts.privateKeyToAccount(privateKey);
            web3.eth.accounts.wallet.add(account);
            this.web3 = web3;
        }
        return this.web3;
    }
    setup_smartcontract(web3){
        this._gasLimit = MedcontractInfo._gasLimit;
        this._gasPrice = MedcontractInfo._gasPrice;
        if (web3) { /* use external web3 instance*/
            this.contract = new web3.eth.Contract(MedcontractInfo.abi, sigUtil.normalize(MedcontractInfo.address));
        } else {
            this.contract = new this.web3.eth.Contract(MedcontractInfo.abi, sigUtil.normalize(MedcontractInfo.address));
        }
        return this.contract;
    }

    wait_for_receipt(web3,txhash, timeoutsec, cb, periodsec = 5){
        var wait_for_receipt=this.wait_for_receipt;
        let err = null;
        let result = null;
        if (timeoutsec > 0) {
            timeoutsec = timeoutsec - periodsec;
        } else {
            err = 'timeout';
            cb(err, result);
            return;
        }
        web3.eth.getTransactionReceipt(txhash, (error, res) => {
            if (error) {
                cb(error, result);
            } else {
                if (res) {
                    abiDecoder.addABI(MedcontractInfo.abi);
                    let receipt = abiDecoder.decodeLogs(res.logs);
                    let ret = {
                        raw: res,
                        receipt: receipt,
                    }
                    cb(null, ret);
                } else {
                    setTimeout(() => {
                        wait_for_receipt(web3,txhash, timeoutsec, cb, periodsec);
                    }, periodsec * 1000);
                }
            }
        })
    }

    getFee(){
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.getFee().call({ from: _fromaddr });
    }
    setFee(fee_wei){
        //let wei = this.web3.utils.toWei(howmuch_eth.toString(), 'ether');
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        //let _fromaddr = "0x88AB183F9722D0Cd9117079Ef65Da7F7e8C72229".toLowerCase();//
        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this.gasPrice, // default gas price in wei, 20 gwei in this case
            value: this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.setFee(fee_wei).send(opt);
    }



}

module.exports=DappHandler;