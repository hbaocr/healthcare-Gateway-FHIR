var service_acc = require("./accountInfo");
var MedcontractInfo = require("./contractInfo");
var sigUtil = require('eth-sig-util');
var Web3 = require('web3');
// https://web3js.readthedocs.io/en/1.0/web3.html#value
// becasue The HTTP provider is deprecated, as it won’t work for subscriptions ( listen event from smartcontract)
// need to enable websocket provider api to support app listen from smartcontract
module.exports = {
    _gasPrice: '20000000000',
    _gasLimit: 1500000,
    setup_web3_http: (web3) => {
        this._gasLimit = 1500000;
        this._gasPrice = '20000000000';
        if (web3) {
            // var privateKey = sigUtil.normalize(service_acc.prvK);
            // //https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#wallet
            // var account = web3.eth.accounts.privateKeyToAccount(privateKey);
            // web3.eth.accounts.wallet.add(account);
            this.web3 = web3; //use external web3
        } else {
            var web3 = new Web3(new Web3.providers.HttpProvider(service_acc.rpchost));
            var privateKey = sigUtil.normalize(service_acc.prvK);
            //https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#wallet
            var account = web3.eth.accounts.privateKeyToAccount(privateKey);
            web3.eth.accounts.wallet.add(account);
            this.web3 = web3;
        }

        return this.web3;
    },
    setup_web3_websocket: (web3) => {
        this._gasLimit = 1500000;
        this._gasPrice = '20000000000';
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
    },
    setup_smartcontract: (web3) => {
        this._gasLimit = 1500000;
        this._gasPrice = '20000000000';
        if (web3) { /* use external web3 instance*/
            this.contract = new web3.eth.Contract(MedcontractInfo.abi, sigUtil.normalize(MedcontractInfo.address));
        } else {
            this.contract = new this.web3.eth.Contract(MedcontractInfo.abi, sigUtil.normalize(MedcontractInfo.address));
        }
        return this.contract;
    },

    subscribe_to_all_event_of_contract: (_filter, fn_cb, fromblock) => {
        let filter_opt = {};
        filter_opt.filter = _filter;
        if (fromblock) {
            filter_opt.fromBlock = fromblock
        } else {
            filter_opt.fromBlock = 0;
        }
        this.contract.events.allEvents(filter_opt, function (error, event) { })
            .on('data', function (event) {
                //console.log(event); // same results as the optional callback above
                if (fn_cb) {
                    fn_cb(event);
                } else {
                    console.log(event); // same results as the optional callback above
                }
            })
            .on('changed', function (event) {
                // remove event from local database
            })
            .on('error', console.error);
    },
    subscribe_once_alarmInfo_event: (_filter, fn_cb, fromblock) => {
        let filter_opt = {};
        filter_opt.filter = _filter;
        if (fromblock) {
            filter_opt.fromBlock = fromblock
        } else {
            filter_opt.fromBlock = 0;
        }
        if (fn_cb) {
            this.contract.once('alarmInfo', filter_opt, fn_cb);
        } else {
            this.contract.once('alarmInfo', filter_opt, (error, event) => { console.log(event); });
        }
    },
    //=========For serviceprovider=================
    getFee: () => {
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.getFee().call({ from: _fromaddr });
    },
    setFee: (fee_wei) => {
        //let wei = this.web3.utils.toWei(howmuch_eth.toString(), 'ether');
       let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        //let _fromaddr = "0x88AB183F9722D0Cd9117079Ef65Da7F7e8C72229".toLowerCase();//

        // = web3.utils.toBN(1);
        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this.gasPrice, // default gas price in wei, 20 gwei in this case
            value: this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.setFee(fee_wei).send(opt);
    },


    //=========For ORG===========================================================

    //isOrgAvailable("0x699Dc2B03d84bF12EAa57898F653B4A32AdB9a6D").then(console.log);
    isOrgAvailable: (_orgId) => {
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.isOrgAvailable(_orgId).call({ from: _fromaddr });
    },
    updateOrgRegisterInfo: (_name, fee_wei = 0) => {
        // let wei = this.web3.utils.toWei(howmuch_eth.toString(), 'ether');   // = web3.utils.toBN(1);
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;

        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this._gasPrice, // default gas price in wei, 20 gwei in this case
            value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.updateOrgRegisterInfo(_name).send(opt);
    },
    //getOrgName("0x88AB183F9722D0Cd9117079Ef65Da7F7e8C72229").then(console.log);
    getOrgName: (_orgId) => {
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.getOrgName(_orgId).call({ from: _fromaddr });
    },
    getAllOrgs: () => {
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.getAllOrgs().call({ from: _fromaddr });
    },
    getPatientsOfOrg: () => {
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.getPatientsOfOrg().call({ from: _fromaddr });
    },

    //=================For patients DTB===================
    isPatAvailable: (_patId) => {
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.isPatAvailable(_patId).call({ from: _fromaddr });
    },
    //only owner can call this function
    getAllPatients: () => {
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.getAllPatients().call({ from: _fromaddr });
    },
    updatePatientsRegisterInfo: (_desc, fee_wei = 0) => {
        // let wei = this.web3.utils.toWei(howmuch_eth.toString(), 'ether');   // = web3.utils.toBN(1);
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this._gasPrice, // default gas price in wei, 20 gwei in this case
            value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.updatePatientsRegisterInfo(_desc).send(opt);
    },
    //================For Document=========================
    isPatientDocAvailable: (_patId, _did) => {
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.isPatientDocAvailable(_patId, _did).call({ from: _fromaddr });
    },
    //================For OrgsPatientShareTo===============
    //almost is private
    //===============For control the workflow============== 
    orgUpdatePatientDocument: (_patId, _did, _description, fee_wei) => {
        // let wei = this.web3.utils.toWei(howmuch_eth.toString(), 'ether');   // = web3.utils.toBN(1);
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this._gasPrice, // default gas price in wei, 20 gwei in this case
            value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.orgUpdatePatientDocument(_patId, _did, _description).send(opt)
    },
    orgGetPatientsDocument: (_patID) => {
        // let wei = this.web3.utils.toWei(howmuch_eth.toString(), 'ether');   // = web3.utils.toBN(1);
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        let fee_wei = 0;
        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this._gasPrice, // default gas price in wei, 20 gwei in this case
            value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.orgGetPatientsDocument(_patID).send(opt);
    },
    orgGetPatientsDocumentIsReadable: (_patID) => {
        // let wei = this.web3.utils.toWei(howmuch_eth.toString(), 'ether');   // = web3.utils.toBN(1);
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        let fee_wei = 0;
        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this._gasPrice, // default gas price in wei, 20 gwei in this case
            value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.orgGetPatientsDocumentIsReadable(_patID).send(opt);
    },
    checkPermissionOfOrgsWithPatient: (_orgID, _patID) => {
        // let wei = this.web3.utils.toWei(howmuch_eth.toString(), 'ether');   // = web3.utils.toBN(1);
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        let fee_wei = 0;
        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this._gasPrice, // default gas price in wei, 20 gwei in this case
            value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.checkPermissionOfOrgsWithPatient(_orgID, _patID).send(opt);
    },
    serviceProviderCheckPermissionOfOrgsWithPatient: (_orgID, _patID) => {
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        let fee_wei = 0;
        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this._gasPrice, // default gas price in wei, 20 gwei in this case
            value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.serviceProviderCheckPermissionOfOrgsWithPatient(_orgID, _patID).send(opt);
    },
    //==============For patient===================
    patientGetDesc: () => {
        //let _fromaddr = "0x88AB183F9722D0Cd9117079Ef65Da7F7e8C72229".toLowerCase();//
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        return this.contract.methods.patientGetDesc().call({ from: _fromaddr });
    },
    patientApproveOrgsPermission:(_orgID,_permission,exp_time)=>{
        let _fromaddr = this.web3.eth.accounts.wallet[0].address;
        let fee_wei = 0;
        let opt = {
            from: _fromaddr,
            gas: this._gasLimit,//gas limitted
            gasPrice: this._gasPrice, // default gas price in wei, 20 gwei in this case
            value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        return this.contract.methods.patientApproveOrgsPermission(_orgID,_permission,exp_time).send(opt);
    }
}