
//var hostrpc="http://13.251.160.119:8545";
var service_acc = require("./serviceAccount");
var sigUtil = require('eth-sig-util');
var Web3 = require('web3');//web3 1.0 (https://web3js.readthedocs.io/en/1.0/getting-started.html)
var web3 = new Web3(new Web3.providers.HttpProvider(service_acc.host));
var privateKey = sigUtil.normalize(service_acc.prvK);
//add  account to use by web3
//https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html#wallet
var account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

var wei= web3.utils.toWei('1','Ether').toString();
console.log(wei);

web3.eth.sendTransaction({
    from: account.address,
    to: '0x00744793e08207cff218212d11a00dC0F89a8D6e'.toLowerCase(),
    value: wei,//web3.utils.toBN(howmuch.toString()),
    gasLimit: 21000, 
    gasPrice: 20000000000
})
.then(function(receipt){
   console.log(receipt);
});