window.addEventListener('load', async () => {
    await on_page_load();
    setup_smartcontract();
    display_info();
    setInterval(() => {
        display_info();
    }, 5000);
});

window.ethereum.on('accountsChanged', function (accounts) {
    display_info();
})

window.ethereum.on('networkChanged', function (netId) {
    if (MedcontractInfo.networdID != netId) {
        window.alert('Change to another network--> not support');
    }
})

function display_info() {
    let _from = web3.currentProvider.selectedAddress;
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
    let inf_in = document.getElementById('txt_desc').value;
    if (inf_in == "") {
        alert("Input organization Info before doing update");
        return;
    }
    getFee().then((w) => {
        document.getElementById('txt_desc').value = "";
        return updateOrgRegisterInfo(inf_in, w);
    })
        .then((evnt) => {
            let txid = evnt.transactionHash;
            let ret = evnt.receipt[0].events[2].value;
            let err_code = evnt.receipt[0].events[1].value;
            let event_name = evnt.receipt[0].name;
            let disp = 'Event name :' + event_name + "\n" +
                'TxID   : ' + txid + "\n" +
                'Result : ' + ret;
            console.log(disp);
            alert(disp);
        })
        .catch(console.error);
}

