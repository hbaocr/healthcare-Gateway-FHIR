window.addEventListener('load', async () => {
    await on_page_load();
    setup_smartcontract();
   
    if(display_info){
        display_info();
    }
    //authen_request();//request to signed and authen
    setInterval(() => {
        if(display_info){
            display_info();
        }
       
    }, 5000);
   
    $("#btn_org_submit_patient_report").click(on_org_submit_patient_report_click);
  
    $("#btn_org_read_patient_report").click(on_org_checkout_patient_report_click);
   
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

    org_get_info(_from).then((inf) => {
        if (inf._name == "") {
            setHTMLTag('txt_orgInf', 'Organization has not registered yet');
            setHTMLTagTextColor('txt_orgInf','red');
        } else {
            setHTMLTagTextColor('txt_orgInf','black');
            let utc = inf._last_utc;
            let local_date=""
            if(utc>0){
                local_date = new Date(utc*1000).toLocaleString();
            }
            setHTMLTag('txt_orgInf', inf._name + '@'+local_date);
        }
    });

    let _pID= document.getElementById('txt_patID').value.toLowerCase();
    let isValid = web3.utils.isAddress(_pID);
    if(isValid){
        setHTMLTagTextColor('txt_patID','black');
        if(_pID.indexOf("0x") !=0){
            _pID="0x"+_pID;
        }
        document.getElementById('txt_patID').value=_pID.toLowerCase();
        pat_get_info(_pID).then((inf) => {
            if (inf._name == "") {
                setHTMLTag('txt_patInfo', 'patient not available');
                setHTMLTagTextColor('txt_patInfo','red');
            } else {
                setHTMLTagTextColor('txt_patInfo','black');
                setHTMLTag('txt_patInfo', inf._name);
            }
        });

    }else{
        setHTMLTagTextColor('txt_patID','red');
        setHTMLTagTextColor('txt_patInfo','red');
        setHTMLTag('txt_patInfo', "patient not available");
    }

}

function on_org_submit_patient_report_click(){
    let $btn = $(this);
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
    _report = _report
    +"\nCreated by    : "+ _from
    +"\nPatient       : "+ _patId
    +"\nUTC timestamp : "+ Date.now().toString();//add time to report
    document.getElementById('txt_report').value=_report;

    let _did=create_did(_from,_report);
    let _desc = 'this is example of patient report on blockchain';

    $btn.button('loading'); 
    let valid_cookies_token_link = MedcontractInfo.gateway_host +'/is_login_legit';
    do_http_post(valid_cookies_token_link,{}).then((isValid)=>{
        if(isValid){
            return get_fee();
        }else{
            $btn.button('reset');
            window.alert('Login Token Expired!Please Do Authentication Again ');
            return;
        }
    })
    .then((w) => {
        return org_insert_pat_did(_patId,_did,_desc,w,120);
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
            $btn.button('reset');
        }
    })
    .then((_res)=>{
        if(_res.data.isValid){
            let disp='Success to Insert new documents to patient'+"\n"+
            'document_id : '+_did;
            console.log(disp);
            window.alert(disp);
            $btn.button('reset');
        }else{
            window.alert('Update Blockchain Ok but FHIR failed');
            $btn.button('reset');
        }
        console.log(_res);
    })
    .catch((err)=>{
        window.alert('Update failed '+err.toString());
        console.error(err);
        $btn.button('reset');
    })
}

function on_org_checkout_patient_report_click(){
    let $btn = $(this);
    let _from=get_selected_addr();
    let _pID= document.getElementById('txt_patID').value.toLowerCase();
    let isValid = web3.utils.isAddress(_pID);
    if(isValid==false){
        window.alert("Please insert the vailid Patient address");
        return;
    }
    $btn.button('loading');
    let valid_cookies_token_link = MedcontractInfo.gateway_host +'/is_login_legit';
    do_http_post(valid_cookies_token_link,{}).then((isValid)=>{
        if(isValid){
            return get_fee();
        }else{
            $btn.button('reset');
            window.alert('Login Token Expired!Please Do Authentication Again ');
            return;
        }
    })
    .then((w) => {
        //reserve for future when read info also pay (enable)
        //in this case --> read don't pay
        
        return org_read_pat_did(_from,_pID,0,120);
    })
    .then((evnt) => {

        if(evnt.receipt[0].events[1].value !=0){ //error code check --> err
            let disp = 'Event name : ' + evnt.receipt[0].name + "\n" +
                       'Message    : ' + evnt.receipt[0].events[2].value + "\n" +
            console.log(disp);
            alert(disp);
            $btn.button('reset');
        }else{
            //gate way will check the info in receipt through txid
            let ret ={
                txid: evnt.transactionHash,
                //dids: evnt.receipt[0].events[4].value, //maybe need in future to double check
                from: _from,
                patID:_pID
             }
             let link = MedcontractInfo.gateway_host + '/fhir_org_read_pat_did';
             return do_http_post(link, ret);
        }
    })
    .then((_res)=>{
        $btn.button('reset');
        let disp=_res.data.msg;
        window.alert(disp);
        if(_res.data.isValid){
            let _rp=_res.data.details;
            let my_tbl=[];

            for(let i=0;i<_rp.length;i++){
                if(_rp[i]){
                    let row={
                        OrgID:_rp[i].org,
                        Date:_rp[i].meta.lastUpdated,
                        Report:JSON.parse(_rp[i].report).report
                    }
                    my_tbl.push(row);
                }
            }
            console.log(my_tbl);

            $('#tbl_patient_report').bootstrapTable({
                columns: [{
                    field: 'Date',
                    title: 'Date'
                }, {
                    field: 'OrgID',
                    title: 'OrgID'
                }, {
                    field: 'Report',
                    title: 'Report'
                }],
                data: my_tbl,
                onLoadSuccess: function(){ //not work need to be fixed
                    console.log('Load OK');
                    $('.fixed-table-loading').hide();
                  },
            });
        }
        console.log(_res);
    })
    .catch((err)=>{
        window.alert('Read failed '+err.toString());
        console.error(err);
        $btn.button('reset');
    })
}