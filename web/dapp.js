const server = "http://127.0.0.1:3000";
const signed_msg="HealthcareFHIR Signature";
function on_org_fhir_management(){
    //alert('on_org_fhir_management');
    eth_personal_sign
}
function on_patients_fhir_management(){
    alert('on_patients_fhir_management');
}
async function on_page_load(){
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
function eth_personal_sign(str_msg) {
    let from = get_selected_addr();
    if (!from) return connect();
    return web3.eth.getBlockNumber()
        .then((blockcnt) => {
            var nonce = Math.floor(blockcnt / 10);
            str_msg = str_msg + ':' + nonce;
            return web3.eth.personal.sign(str_msg, from, "");//sign through metamask
        })
}
function get_selected_addr() {
    return web3.currentProvider.selectedAddress;
}

function setup_smartcontract(){
    window._gasLimit = 1500000;
    window._gasPrice = '20000000000';
    if (web3) { /* use external web3 instance*/
        window.contract = new web3.eth.Contract(MedcontractInfo.abi, MedcontractInfo.address);
    } else {
        window.contract = new this.web3.eth.Contract(MedcontractInfo.abi, MedcontractInfo.address);
    }
    return window.contract;
}

//================Smartcontract Handle========================
function getFee(){
    let _fromaddr = web3.currentProvider.selectedAddress;
    return contract.methods.getFee().call({ from: _fromaddr });
}
function updateOrgRegisterInfo(org_info,fee_wei){
    let _fromaddr = web3.currentProvider.selectedAddress;
    let opt = {
        from: _fromaddr,
        gas: _gasLimit,//gas limitted
        gasPrice: _gasPrice, // default gas price in wei, 20 gwei in this case
        value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
    }
    return contract.methods.updateOrgRegisterInfo(org_info).send(opt);
}
function getOrgName(_orgId){
    let _fromaddr = web3.currentProvider.selectedAddress;
    return contract.methods.getOrgName(_orgId).call({ from: _fromaddr });
}
