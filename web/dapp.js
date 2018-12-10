const server = MedcontractInfo.gateway_host;
const fhir_endpoint=MedcontractInfo.fhir_api;
const signed_msg=MedcontractInfo.msg_signed;
var configheader = {
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
    }
};
var signature;
//https://metamask.github.io/metamask-docs/Advanced_Concepts/Provider_API#ethereum.on(eventname%2C-callback)
window.ethereum.on('accountsChanged', function (accounts) {
    // Time to reload your interface with accounts[0]!
    console.log('change acc ',accounts);
  })
  
  window.ethereum.on('networkChanged', function (netId) {
    // Time to reload your interface with netId
    console.log('change network ',netId);
  })

function do_authentication(){
   //alert('on_org_fhir_management');
   return eth_personal_sign(signed_msg)
   .then((_signature)=>{
       signature =_signature;
       let link  = server+"/jwt_authen";

       let from = get_selected_addr();
       if (!from) return connect();
       let jsdata = JSON.stringify({
           account: from,
           signed: _signature,
       });
       console.log('signature : ', jsdata);
       return axios.post(link, jsdata, configheader)
   });
}

function on_org_fhir_management(){
    do_authentication().then((params)=>{
        alert(params.data.message);
        window.location=server+"/"+'clinics_fhir.html'; // redirect to new page with cookies also
    })
    .catch(console.error);
}
function on_patients_fhir_management(){
   // alert('on_patients_fhir_management');   
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
function eth_personal_sign(msg) {
    let from = get_selected_addr();
    if (!from) return connect();
    return web3.eth.getBlockNumber()
        .then((blockcnt) => {
            let interval= MedcontractInfo.block_interval;
            interval=(interval==0)?20:interval;
            var nonce = Math.floor(blockcnt / interval);
            let str_msg = msg + ':' + nonce;
            return web3.eth.personal.sign(str_msg, from, "");//sign through metamask
        })
}
function get_selected_addr() {
    return web3.currentProvider.selectedAddress;
}

function setup_smartcontract(){
    window._gasLimit = MedcontractInfo._gasLimit;
    window._gasPrice = MedcontractInfo._gasPrice;
    // if (web3) { /* use external web3 instance*/
    //     window.contract = new web3.eth.Contract(MedcontractInfo.abi, MedcontractInfo.address);
    // } else {
    //     window.contract = new this.web3.eth.Contract(MedcontractInfo.abi, MedcontractInfo.address);
    // }
    window.contract=web3.eth.contract(MedcontractInfo.abi).at( MedcontractInfo.address)
    return window.contract;
}

//================Smartcontract Handle========================
function getFee(){
    return new Promise((resolve,reject)=>{
        let _fromaddr = web3.currentProvider.selectedAddress;
        contract.getFee({ from: _fromaddr },function(err, result){
            if (!err){
                resolve(result);
            }else{
                reject(err);
            }
        })
    })
    //let _fromaddr = web3.currentProvider.selectedAddress;
   // return contract.methods.getFee().call({ from: _fromaddr });
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
   // let _fromaddr = web3.currentProvider.selectedAddress;
   // return contract.methods.getOrgName(_orgId).call({ from: _fromaddr });
   return new Promise((resolve,reject)=>{
    let _fromaddr = web3.currentProvider.selectedAddress;
    contract.getOrgName(_orgId,{ from: _fromaddr },function(err, result){
        if (!err){
            resolve(result);
        }else{
            reject(err);
        }
    })
})
}
