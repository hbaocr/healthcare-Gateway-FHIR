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
        //console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        setHTMLTag('txt_status','Can not find Metamask. Please Install Metamask plugin')
    }
    display_info();
}
function display_info() {
    setHTMLTag('txt_web3api', web3.version);
    setHTMLTag('txt_addr', web3.currentProvider.selectedAddress);
    setHTMLTag('txt_network', web3.currentProvider.networkVersion);
    web3.eth.getProtocolVersion().then((data) => {
        setHTMLTag('txt_protocol', data);
    })
    web3.eth.net.getPeerCount().then((data) => {
        setHTMLTag('txt_peer', data);
    })
    web3.eth.getBlockNumber().then((data) => {
        setHTMLTag('txt_blocknum', data);
    })
    web3.eth.net.getNetworkType().then((data) => {
        setHTMLTag('txt_type', data);
    })
    web3.eth.getNodeInfo().then((data) => {
        setHTMLTag('txt_eth', data);
    })
}
function get_selected_addr() {
    return web3.currentProvider.selectedAddress;
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

setInterval(() => {
    display_info();
}, 5000);

function on_metamask_login_click() {
    let config = {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        }
    };
    let host = server+"/submit_credential";
    let msg_signed = "Healthcare Signature";

    eth_personal_sign(msg_signed)
        .then((sign) => {
            let from = get_selected_addr();
            if (!from) return connect();
            let jsdata = JSON.stringify({
                account: from,
                signed: sign,
            });
            console.log('signature : ', jsdata);
            return axios.post(host, jsdata, config)
        })
}

function on_metamask_login_org(){
    let host =server+"/org";
    window.open(host);
}