const server = "http://127.0.0.1:3000";
window.addEventListener('load', on_page_load);
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
        // Acccounts always exposed
    } else {  // Non-dapp browsers...
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        //setHTMLTag('txt_status','Can not find Metamask. Please Install Metamask plugin')
    }
    setup_smartcontract();
    display_info();
}
function display_info(){
    let _from =web3.currentProvider.selectedAddress;
    setHTMLTag('txt_web3api', web3.version);
    setHTMLTag('txt_addr',_from );
    
    web3.eth.getBalance(_from).then((w)=>{
        setHTMLTag('txt_balance',w.toString())
    })
    getFee().then((w)=>{
        setHTMLTag('txt_fee',w.toString())
    })
    web3.eth.getBlockNumber().then((data) => {
        setHTMLTag('txt_blocknum', data);
    })

    setHTMLTag('txt_network', web3.currentProvider.networkVersion);
    web3.eth.net.getNetworkType().then((data) => {
        setHTMLTag('txt_type', data);
    })

    getOrgName(_from).then((inf)=>{
        if(inf==""){
            setHTMLTag('txt_orgInf','Organization has not registered yet');
        }else{
           setHTMLTag('txt_orgInf',inf);
        }
    });
}
setInterval(() => {
    display_info();
}, 3000);
function on_org_update(){
    let inf_in = document.getElementById('txt_desc').value;
    if(inf_in==""){
        alert("Input organization Info before doing update");
        return;
    }
    getFee().then((w)=>{
        document.getElementById('txt_desc').value="";
        return updateOrgRegisterInfo(inf_in,w);
    })
    .then((receipt)=>{
        let  txid = receipt.transactionHash;
        let  ret  = receipt.events.alarmInfo[0].returnValues[2];
        let  err_code = receipt.events.alarmInfo[1].returnValues[1];
        let disp= 'TxID   : '+ txid + "\n"+ 
                  'Result : '+ ret;
        console.log(disp);
        alert(disp);
    })
    .catch(console.error);
}