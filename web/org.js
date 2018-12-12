//var _selected_addr;
window.addEventListener('load', async () => {
    await on_page_load();
    setup_smartcontract();
    display_info();
    setInterval(() => {
        display_info();
    }, 5000);
});

window.ethereum.on('accountsChanged', (accounts) => {
    display_info();
    // if(_selected_addr!=accounts[0]){
    //     display_info();

    //     setTimeout(() => {

    //         req_authen_jwt_cookies().then((res) => {
    //             window.alert(res.data.message);
    //         })
    //         .catch(console.error);
    //     }, 2000); // call after 2 sec
    // }


})

window.ethereum.on('networkChanged', function (netId) {
    // if (MedcontractInfo.networdID != netId) {
    //     window.alert('Change to another network--> not support');
    // }
})

function display_info() {
    web3 = get_web3_10();
    let _from = web3.currentProvider.selectedAddress;
    //_selected_addr=_from;
    setHTMLTag('txt_web3api', web3.version);
    setHTMLTag('txt_addr', _from);

    web3.eth.getBalance(_from).then((w) => {
        setHTMLTag('txt_balance', w.toString())
    })
    getFee().then((w) => {
        setHTMLTag('txt_fee', w.toString())
    })
    web3.eth.getBlockNumber().then((data) => {
        setHTMLTag('txt_blocknum', data);
    })

    setHTMLTag('txt_network', web3.currentProvider.networkVersion);
    web3.eth.net.getNetworkType().then((data) => {
        setHTMLTag('txt_type', data);
    })

    getOrgName(_from).then((inf) => {
        if (inf == "") {
            setHTMLTag('txt_orgInf', 'Organization has not registered yet');
        } else {
            setHTMLTag('txt_orgInf', inf);
        }
    });
}

function on_org_update() {
    let _from=get_selected_addr();
    let inf_in = document.getElementById('txt_desc').value;
    if (inf_in == "") {
        alert("Input organization Info before doing update");
        return;
    }

    let valid_cookies_token_link = MedcontractInfo.gateway_host +'/is_login_legit';
    do_http_post(valid_cookies_token_link,{}).then((isValid)=>{
        if(isValid){
            return getFee();
        }else{
            window.alert('Token Expired!Please Do Authentication Again ');
        }
      
    })
    .then((w) => {
        document.getElementById('txt_desc').value = "";
        return updateOrgRegisterInfo(inf_in, w);
    }).then((evnt) => {
            let ret = {
                info:inf_in,/**info update to smart contract */
                txid: evnt.transactionHash,
                from: _from,
                ret_msg: evnt.receipt[0].events[2].value,
                event_name: evnt.receipt[0].name,
                err_code: evnt.receipt[0].events[1].value,
            }

            if (ret.err_code == 0) { //* update block chain OK */
                let link = MedcontractInfo.gateway_host + '/fhir_org_update';
                do_http_post(link, ret)
                    .then((_res) => {
                        if(_res.data.isValid){
                            window.alert('Success to Update Organization');
                        }else{
                            window.alert('Update Blockchain Ok but FHIR failed');
                        }
                        console.log(_res);
                    })
            } else {
                let disp = 'Event name :' + ret.event_name + "\n" +
                    'TxID   : ' + ret.txid + "\n" +
                    'Result : ' + ret.ret_msg;
                console.log(disp);
                alert(disp);
            }


        })
        .catch((err)=>{
            window.alert('Update failed '+err.toString());
            console.error(err);
        });
}

