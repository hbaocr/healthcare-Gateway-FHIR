
window.addEventListener('load', async () => {
    await on_page_load();
    setup_smartcontract();
   
    if(display_info){
        display_info();
    }
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
function on_submit_patient_report_click(){
    //window.alert('you are here');
    let _from=get_selected_addr();
    let _report = document.getElementById('txt_report').value;
    let _patId=document.getElementById('txt_patID').value;
    if (_report == "") {
        window.alert("Input report Info");
        return;
    }
    if (_patId == "") {
        window.alert("Input patient address");
        return;
    }else{
        _patId = _patId.trim().toLowerCase();
        document.getElementById('txt_patID').value=_patId;
        if(_patId.length !=42){
            window.alert("Invalid patient address");
            return;
        }
    }
    let _did=web3.utils.sha3(_report+_patId+ Date.now().toString()) ;
    let _desc = 'this is example of patient report on blockchain';
    
    let valid_cookies_token_link = MedcontractInfo.gateway_host +'/is_login_legit';
    do_http_post(valid_cookies_token_link,{}).then((isValid)=>{
        if(isValid){
            return getFee();
        }else{
            window.alert('Login Token Expired!Please Do Authentication Again ');
            return;
        }
    })
    .then((w) => {
        return orgUpdatePatientDocument(_patId,_did,_desc,w,120);
    })
    .then((evnt) => {
        let ret = {
            info:_report,/**info update to smart contract */
            did:_did,
            patID:_patId,
            descript:_desc,
            txid: evnt.transactionHash,
            from: _from,
            ret_msg: evnt.receipt[0].events[2].value,
            event_name: evnt.receipt[0].name,
            err_code: evnt.receipt[0].events[1].value,
        }

        if (ret.err_code == 0) { //* update block chain OK */
            let link = MedcontractInfo.gateway_host + '/fhir_org_insert_patient';
            return do_http_post(link, ret);
        }else{
            let disp = 'Event name :' + ret.event_name + "\n" +
            'TxID   : ' + ret.txid + "\n" +
            'DID    : ' + ret.did + "\n" +
            'Result : ' + ret.ret_msg;
            console.log(disp);
            alert(disp);
        }
    })
    .then((_res)=>{
        if(_res.data.isValid){
            let disp='Success to Insert new documents to patient'+"\n"+
            'document_id : '+_did;
            console.log(disp);
            window.alert(disp);
        }else{
            window.alert('Update Blockchain Ok but FHIR failed');
        }
        console.log(_res);
    })
    .catch((err)=>{
        window.alert('Update failed '+err.toString());
        console.error(err);
    })
}
