
window.addEventListener('load', async () => {
    await on_page_load();
    setup_smartcontract();
    display_info();
});

function display_info() {
    let _from = web3.currentProvider.selectedAddress;
    setHTMLTag('txt_web3api', "web3@" + web3.version.api);
    setHTMLTag('txt_addr', _from);

    web3.eth.getBalance(_from, (err, w) => {
        setHTMLTag('txt_balance', w.toString())
    })
    getFee().then((w) => {
        setHTMLTag('txt_fee', w.toString())
    })
    // web3.eth.getBlockNumber((data) => {
    //     setHTMLTag('txt_blocknum', data.toString());
    // })
    web3.eth.getBlockNumber((err, cnt) => { setHTMLTag('txt_blocknum', cnt) });
    setHTMLTag('txt_network', web3.currentProvider.networkVersion);
    web3.version.getNetwork((err, data) => {
        if (data > 5) {
            setHTMLTag('txt_type', 'private');
        } else {
            setHTMLTag('txt_type', data);
        }

    })

    getOrgName(_from).then((inf) => {
        if (inf == "") {
            setHTMLTag('txt_orgInf', 'Organization has not registered yet');
        } else {
            setHTMLTag('txt_orgInf', inf);
        }
    });
}
setInterval(() => {
    display_info();
}, 3000);
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
        .then((receipt) => {
            let txid = receipt.transactionHash;
            let ret = receipt.events.alarmInfo[0].returnValues[2];
            let err_code = receipt.events.alarmInfo[1].returnValues[1];
            let disp = 'TxID   : ' + txid + "\n" +
                'Result : ' + ret;
            console.log(disp);
            alert(disp);

        })
        .catch(console.error);
}


