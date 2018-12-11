const server = MedcontractInfo.gateway_host;
const signed_msg = MedcontractInfo.msg_signed;
const _gasLimit = MedcontractInfo._gasLimit;
const _gasPrice = MedcontractInfo._gasPrice;
var configheader = {
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    }
};
var signature;
function on_org_fhir_management() {
    //alert('on_org_fhir_management');
    eth_personal_sign(signed_msg)
        .then((_signature) => {
            signature = _signature;
           

            let from = get_selected_addr();
            if (!from) return connect();
            let jsdata = JSON.stringify({
                account: from,
                signed: _signature,
            });
            console.log('signature : ', jsdata);
            let link = server + "/jwt_authen";
            return axios.post(link, jsdata, configheader);
        })
        .then((res) => {
            if (res.data.err_code == 0) {
                window.location = server + "/clinics_fhir.html";
            }
            window.alert(res.data.message);
        })
        .catch(console.error);
}
function on_patients_fhir_management() {
    alert('on_patients_fhir_management');
    let link = server + "/fhir_org_update";
    return axios.post(link, {'a':'1'}, configheader);
}
async function on_page_load() {
    if (window.ethereum) {// Modern dapp browsers...
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();  //  // Request account access if needed.Acccounts now exposed     
        } catch (error) {
            console.log(error);
        }
    } else if (window.web3) {//  Legacy dapp browsers...
        window.web3 = new Web3(web3.currentProvider);
    } else {  // Non-dapp browsers...
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
}

function setHTMLTag(tagId, info_str) {
    document.getElementById(tagId).innerHTML = info_str;
}
function getHTMLTag(tagId) {
    return document.getElementById(tagId).value;
}
function connect() {
    if (typeof ethereum !== 'undefined') {
        ethereum.enable()
            .catch(console.error)
    }
}
function eth_personal_sign(msg) {
    let from = get_selected_addr();
    if (!from) return connect();
    return web3.eth.getBlockNumber()
        .then((blockcnt) => {
            let interval = MedcontractInfo.block_interval;
            interval = (interval == 0) ? 20 : interval;
            var nonce = Math.floor(blockcnt / interval);
            let str_msg = msg + ':' + nonce;
            return web3.eth.personal.sign(str_msg, from, "");//sign through metamask
        })
}
function get_selected_addr() {
    return web3.currentProvider.selectedAddress;
}

function setup_smartcontract() {

    if (web3) { /* use external web3 instance*/
        window.contract = new web3.eth.Contract(MedcontractInfo.abi, MedcontractInfo.address);
    } else {
        window.contract = new this.web3.eth.Contract(MedcontractInfo.abi, MedcontractInfo.address);
    }
    abiDecoder.addABI(MedcontractInfo.abi);// lib for decode transaction receipt.logs
    /**
     *  abidecoder.addABI(abi)
        abidecoder.decodeLogs(txReceipt.logs)
     */
    return window.contract;
}


function wait_for_receipt(txhash, timeoutsec, cb, periodsec = 5) {
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
                cb(null, res);
            } else {
                setTimeout(() => {
                    wait_for_receipt(txhash, timeoutsec, cb, periodsec);
                }, periodsec * 1000);
            }
        }
    })
}
//================Smartcontract Handle========================
function getFee() {
    let _fromaddr = web3.currentProvider.selectedAddress;
    return contract.methods.getFee().call({ from: _fromaddr });
}
function updateOrgRegisterInfo(org_info, fee_wei,timeoutsec=120) {
    return new Promise((resolve, reject) => {
        let _fromaddr = web3.currentProvider.selectedAddress;
        let opt = {
            from: _fromaddr,
            gas: _gasLimit,//gas limitted
            gasPrice: _gasPrice, // default gas price in wei, 20 gwei in this case
            value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
        }
        contract.methods.updateOrgRegisterInfo(org_info).send(opt)
            .on('transactionHash', function (hash) {
                console.log('tx hash : ', hash);
                wait_for_receipt(hash, timeoutsec, (err, res) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        let evnt={
                            receipt:abiDecoder.decodeLogs(res.logs),
                            transactionHash: res.transactionHash,
                            gasUsed: res.cumulativeGasUsed,
                            blocknum:res.blockNumber
                        };
                        console.log(evnt);
                        resolve(evnt);
                    }
                });
            })
    });
}
function getOrgName(_orgId) {
    let _fromaddr = web3.currentProvider.selectedAddress;
    return contract.methods.getOrgName(_orgId).call({ from: _fromaddr });
}