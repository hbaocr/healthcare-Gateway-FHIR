
var cors = require('cors');
var bodyParser = require('body-parser');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var express = require('express');
var sigUtil = require('eth-sig-util');
var ethUtil = require('ethereumjs-util');
var Dapp = require('./DAppHandler');
var fs = require('fs');
var MedcontractInfo = require("./contractInfo");
var config = require("./config/config");
var app = express();
var app_port = 8000;
var app_bind_ip = "0.0.0.0";
var web3 = Dapp.setup_web3_websocket();

var FhirApi = require("./FhirApi");
var fhirhost = "http://127.0.0.1:3000/3_0_1/";
var fhir = new FhirApi(fhirhost);
// fhir.search_data_fhir(fhir.FHIRservice.ImagingStudy,searchparas).then((res)=>{
//     console.log(res.data)
// });




// at first sync up with web the contract Info
function generate_contract_info_to_webjs() {

    let ret = "MedcontractInfo = " + JSON.stringify(MedcontractInfo);
    let pathcontract = __dirname + '/web' + '/contract_config.js';
    console.log('sync up smartcontract setup to web at  : ', pathcontract);
    fs.writeFileSync(pathcontract, ret);
}
generate_contract_info_to_webjs();

const ProtectedRoutes = express.Router();

//my middle ware to check  jwt token on cookies

function checkJwtToken(req, res, next){
    var token = req.headers['access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        let pass = app.get('PassJwt')
        jwt.verify(token, pass, (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        return res.status(403).send({  // forbiden
            message: 'No token provided.'
        });
    }
}


// use morgan to log requests to the console
app.use(morgan('dev'));
//Set the env PassJwt value
app.set('PassJwt', config.secret);


app.use(bodyParser.json());
app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));



app.use("/", express.static(__dirname + '/web'));//mount root of web to 'web'
app.use('/fhir', ProtectedRoutes);
ProtectedRoutes.use((req, res, next) => {
    // check header or url parameters or post parameters for token
    var token = req.headers['access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        let pass = app.get('PassJwt')
        jwt.verify(token, pass, (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        return res.status(403).send({  // forbiden
            message: 'No token provided.'
        });
    }
});
//['/clinics_fhir.html','/submit_credential']

setInterval(async () => {

    let cnt = await web3.eth.getBlockNumber();
    console.log('block cnt :', cnt);
}, 5000);

function verify_signature(msg, sig, verifying_addr) {
    return new Promise(function (resolve, reject) {
        web3.eth.getBlockNumber()
            .then((blockcnt) => {
                let interval = MedcontractInfo.block_interval;
                interval = (interval == 0) ? 20 : interval;
                var nonce = Math.floor(blockcnt / interval);
                let str_msg = msg + ':' + nonce;
                var msgParams = {
                    data: ethUtil.bufferToHex(new Buffer(str_msg, 'utf8')),
                    sig: sig,
                };
                recovered = sigUtil.recoverPersonalSignature(msgParams);

                if (verifying_addr === recovered) {
                    console.log('--verify valid---addr:verify->' + verifying_addr + ' : ' + recovered);
                    resolve(msgParams);
                } else {
                    console.log('--verify invalid---addr:verify->' + verifying_addr + ' : ' + recovered);
                    reject();
                }
            })
    });

}


app.post('/jwt_authen', function (req, res) {
    let msg_signed = MedcontractInfo.msg_signed;
    let sig = req.body.signed;
    let addr = req.body.account;
    verify_signature(msg_signed, sig, addr).then((payload) => {

        var _token = jwt.sign(payload, app.get('PassJwt'), {
            expiresIn: 1440 // expires in 24 hours
        });
        let valid_time_ms = 15 * 60 * 1000;// 15 min
        let cookies_opt = {
            maxAge: valid_time_ms,
            overwrite:true,//whether to overwrite previously set cookies of the same name (false by default)
            httpOnly: true
        };
        // add to cookies
        res.cookie('fhirtoken', _token, cookies_opt);
        // return the informations to the client
        res.json({
            message: 'FHIR Authentication OK',
            err_code: 0,
            token: _token
        });
    }).catch((err) => {
        res.json({ message: "Error! please check your signature !", err_code: 1 })
    })
});

//for org uppdate their info
app.post('/org_register_update',function(reg,res){

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