//this function use convenience of avaliable web3 provider of metamask
function my_personal_sign(msg) {
    return new Promise((resolve, reject) => {
        let from = web3.currentProvider.selectedAddress;
        let hex_str = new Buffer(msg, 'utf8').toString('hex');
        let web3_hex_msg = "0x" + hex_str;
        console.log('CLICKED, SENDING PERSONAL SIGN REQ');
        var params = [web3_hex_msg, from]
        var method = 'personal_sign'
        web3.currentProvider.sendAsync({
            method,
            params,
            from,
        }, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            if (result.error) {
                reject(result.error);
                return;
            }
            resolve(result.result);
        });
    })
}