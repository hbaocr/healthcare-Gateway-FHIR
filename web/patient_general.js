window.addEventListener('load', async () => {
    await on_page_load();
    setup_smartcontract();
    if(display_info){
        display_info();
    }
    authen_request();//request to signed and authen
    setInterval(() => {
        if(display_info){
            display_info();
        }
    }, 5000);
});

function display_info() {
    web3 = get_web3_10();
    let _from = web3.currentProvider.selectedAddress;
    //_selected_addr=_from;
    setHTMLTag('txt_web3api', web3.version);
    setHTMLTag('txt_addr', _from);

    web3.eth.getBalance(_from).then((w) => {
        setHTMLTag('txt_balance', w.toString())
    })
    get_fee().then((w) => {
        setHTMLTag('txt_fee', w.toString())
    })
    web3.eth.getBlockNumber().then((data) => {
        setHTMLTag('txt_blocknum', data);
    })

    setHTMLTag('txt_network', web3.currentProvider.networkVersion);
    web3.eth.net.getNetworkType().then((data) => {
        setHTMLTag('txt_type', data);
    })

    pat_get_info(_from).then((inf) => {
        if (inf._name == "") {
            setHTMLTag('txt_patInf', 'Patient has not registered yet');
        } else {
            let utc = inf._last_utc;
            let local_date=""
            if(utc>0){
                local_date = new Date(utc*1000).toTimeString();
            }
            setHTMLTag('txt_patInf', inf._name + '@'+local_date);
        }
    });
}

function on_patient_update_click() {
    let _from=get_selected_addr();
    let inf_in = document.getElementById('txt_desc').value;
    if (inf_in == "") {
        alert("Input Patient Info before doing update");
        setHTMLTagTextColor('txt_desc','red');
        return;
    }
    setHTMLTagTextColor('txt_desc','black');

    let _pname="";
    let _paddr="";
    let _pnumner="";
    let _pmail="";
    //  _pname=document.getElementById('txt_name').value;
    //  _paddr=document.getElementById('txt_addr').value;
    //  _pnumner=document.getElementById('txt_phone').value;
    //  _pmail=document.getElementById('txt_mail').value;

    let valid_cookies_token_link = MedcontractInfo.gateway_host +'/is_login_legit';
    do_http_post(valid_cookies_token_link,{}).then((isValid)=>{
        if(isValid){
            return get_fee();
        }else{
            window.alert('Token Expired!Please Do Authentication Again ');
        }
      
    })
    .then((w) => {
        //document.getElementById('txt_desc').value = "";
        return pat_insert_info(inf_in, w);
    }).then((evnt) => {
            let ret = {
                info:inf_in,/**info update to smart contract */
                pname:_pname,
                paddr:_paddr,
                pnumner:_pnumner,
                pmail:_pmail,
                txid: evnt.transactionHash,
                from: _from,
                ret_msg: evnt.receipt[0].events[2].value,
                event_name: evnt.receipt[0].name,
                err_code: evnt.receipt[0].events[1].value,
            }

            if (ret.err_code == 0) { //* update block chain OK */
                let link = MedcontractInfo.gateway_host + '/fhir_pat_update';
                return do_http_post(link, ret);
            } else {
                let disp = 'Event name :' + ret.event_name + "\n" +
                    'TxID   : ' + ret.txid + "\n" +
                    'Result : ' + ret.ret_msg;
                console.log(disp);
                alert(disp);
            }
        })
        .then((_res) => { //do_http_post handle
            if(_res.data.isValid){
                window.alert('Success to Update Patient');
            }else{
                window.alert('Update Blockchain Ok but FHIR failed');
            }
            console.log(_res);
        })
        .catch((err)=>{
            window.alert('Update failed '+err.toString());
            console.error(err);
        });
}