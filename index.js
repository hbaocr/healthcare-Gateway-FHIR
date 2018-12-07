var bodyParser = require('body-parser');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var express = require('express');
var sigUtil = require('eth-sig-util');
var ethUtil = require('ethereumjs-util');
var Dapp = require('./DAppHandler');
var fs = require('fs');
var MedcontractInfo = require("./contractInfo");
var app = express();

// at first sync up with web the contract Info
function generate_contract_info_to_webjs(){
    
    let ret = "MedcontractInfo = "+JSON.stringify(MedcontractInfo);
    let pathcontract=__dirname + '/web'+'/contract_config.js';
    console.log('sync up smartcontract setup to web at  : ',pathcontract);
    fs.writeFileSync(pathcontract,ret);
}

generate_contract_info_to_webjs();

app.use("/", express.static(__dirname + '/web'));//mount root of web to 'web'
app.use(bodyParser.json());
app.use(cookieParser());

var app_port = 3000;
var app_bind_ip = "0.0.0.0";
var web3 = Dapp.setup_web3_websocket();
setInterval(async() => {
   
   let cnt=await web3.eth.getBlockNumber();
   console.log('block cnt :',cnt);
}, 5000);

function verify_signature(str_msg, sig, verifying_addr) {
    return  new Promise(function(resolve,reject){
        web3.eth.getBlockNumber()
        .then((blockcnt) => {
            var nonce = Math.floor(blockcnt / 10);
            str_msg = str_msg + ':' + nonce;
            var msgParams = {
                data: ethUtil.bufferToHex(new Buffer(str_msg, 'utf8')),
                sig: sig,
            };
            recovered = sigUtil.recoverPersonalSignature(msgParams);
          
            if(verifying_addr===recovered){
                console.log('--verify valid---addr:verify->'+verifying_addr+' : '+recovered);
                resolve(1);
            }else{
                resolve(0);
                console.log('--verify valid---addr:verify->'+verifying_addr+' : '+recovered);
            }
        })
    });
  
}


app.post('/submit_credential', function (req, res) {
    let msg_signed = "Healthcare Signature";
    let sig = req.body.signed;
    let addr = req.body.account;
    verify_signature(msg_signed,sig,addr).then((isValid)=>{
        if(isValid>0){ // valid
            res.end('valid');
        }else{
            res.end('invalid');
        }
    });
});


app.listen(app_port, app_bind_ip, function () {
    console.log('Example app listening on ' + app_bind_ip + ':' + app_port);
});




// function eth_personal_sign(hex_str) {
//     let from = get_selected_addr();
//     if (!from) return connect();
//     return web3.eth.getBlockNumber()
//         .then((blockcnt) => {
//             var nonce = Math.floor(blockcnt / 10);
//             hex_str = hex_str + ':' + nonce;
//             return web3.eth.personal.sign(hex_str, from, "");
//         })
// }
// function eth_personal_recover_addr_from_signature(hex_str,sig){
//     return web3.eth.getBlockNumber()
//         .then((blockcnt) => {
//             var nonce = Math.floor(blockcnt / 10);
//             hex_str = hex_str + ':' + nonce;
//             //return web3.eth.personal.sign(hex_str, from, "");
//             return web3.eth.personal.ecRecover(hex_str,sig);
//         })
// }
// var Dapp = require("./DAppHandler");
// var web3=Dapp.setup_web3_websocket();
// var contract=Dapp.setup_smartcontract();
// Dapp.getFee().then(console.log);
// Dapp.setFee(100).then(console.log);
// // Dapp.isOrgAvailable("0x88AB183F9722D0Cd9117079Ef65Da7F7e8C72229").then(console.log);
// // Dapp.isOrgAvailable("0x699Dc2B03d84bF12EAa57898F653B4A32AdB9a6D").then(console.log);
// // Dapp.getOrgName("0x88AB183F9722D0Cd9117079Ef65Da7F7e8C72229").then(console.log);
// // Dapp.getAllOrgs().then(console.log);
// //Dapp.subscribe_once_alarmInfo_event({_fromsender: '0x88AB183F9722D0Cd9117079Ef65Da7F7e8C72229'});
// //Dapp.subscribe_to_all_event_of_contract({_fromsender: '0x88AB183F9722D0Cd9117079Ef65Da7F7e8C72229'});
// //Dapp.updateOrgRegisterInfo("ClinicABC");
// //Dapp.updatePatientsRegisterInfo("patSS");
// //Dapp.isPatAvailable("0x88AB183F9722D0Cd9117079Ef65Da7F7e8C72229").then(console.log);
// Dapp.patientGetDesc().then((data)=>{
//     console.log(data)}
// );