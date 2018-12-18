let faucet_acc = MedcontractInfo.faucet;

window.addEventListener('load', async () => {
    await on_page_load();
    if(display_info){
        display_info();
    }
    authen_request();//request to signed and authen
    setInterval(() => {
        if(display_info){
            display_info();
        }
    }, 5000);
    //for jqueries handle event click
    $("#btn_request_eth").click(on_user_request_click);
});

function display_info() {
    web3 = get_web3_10();
    let _to = web3.currentProvider.selectedAddress;
    //_selected_addr=_from;
    setHTMLTag('txt_web3api', web3.version);
    setHTMLTag('txt_caddr', _to);

    web3.eth.getBalance(faucet_acc).then((w) => {
        setHTMLTag('txt_fbalance', w.toString())
    })

    web3.eth.getBalance(_to).then((w) => {
        setHTMLTag('txt_cbalance', w.toString())
    })
   
    setHTMLTag('txt_faucet', faucet_acc)
  
    web3.eth.getBlockNumber().then((data) => {
        setHTMLTag('txt_blocknum', data);
    })

    setHTMLTag('txt_network', web3.currentProvider.networkVersion);
    web3.eth.net.getNetworkType().then((data) => {
        setHTMLTag('txt_type', data);
    })
}

function on_user_request_click(){
    $btn= $(this);
    $btn.button('loading');
    let _to = web3.currentProvider.selectedAddress;
    data={addr:_to};
    let valid_cookies_token_link = MedcontractInfo.gateway_host +'/is_login_legit';
    do_http_post(valid_cookies_token_link,{}).then((isValid)=>{
        if(isValid){
            let req_link = MedcontractInfo.gateway_host + '/faucet_handler';
            return do_http_post(req_link,data);
        }else{
            $btn.button('reset');
            window.alert('Token Expired!Please Do Authentication Again ');
        }
    }).then((evnt)=>{
        console.log(evnt);
        window.alert(evnt.data.msg);
        $btn.button('reset');
        display_info();
    }).catch((err)=>{
        $btn.button('reset');
        window.alert('Error : ' + err.toString());
    })  
}