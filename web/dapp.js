function setup_smartcontract(){
    window._gasLimit = 1500000;
    window._gasPrice = '20000000000';
    if (web3) { /* use external web3 instance*/
        window.contract = new web3.eth.Contract(MedcontractInfo.abi, MedcontractInfo.address);
    } else {
        window.contract = new this.web3.eth.Contract(MedcontractInfo.abi, MedcontractInfo.address);
    }
    return window.contract;
}

function getFee(){
    let _fromaddr = web3.currentProvider.selectedAddress;
    return contract.methods.getFee().call({ from: _fromaddr });
}

function updateOrgRegisterInfo(org_info,fee_wei){
    let _fromaddr = web3.currentProvider.selectedAddress;
    let opt = {
        from: _fromaddr,
        gas: _gasLimit,//gas limitted
        gasPrice: _gasPrice, // default gas price in wei, 20 gwei in this case
        value: fee_wei,//this.web3.utils.toBN(0)//no need transfer with value of ETH
    }
    return contract.methods.updateOrgRegisterInfo(org_info).send(opt);
}

function getOrgName(_orgId){
    let _fromaddr = web3.currentProvider.selectedAddress;
    return contract.methods.getOrgName(_orgId).call({ from: _fromaddr });
}
