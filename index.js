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

// at first sync up with web the contract Info
function generate_contract_info_to_webjs() {

    let ret = "MedcontractInfo = " + JSON.stringify(MedcontractInfo);
    let pathcontract = __dirname + '/web' + '/contract_config.js';
    console.log('sync up smartcontract setup to web at  : ', pathcontract);
    fs.writeFileSync(pathcontract, ret);
}
generate_contract_info_to_webjs();
app.use("/", express.static(__dirname + '/web'));//mount root of web to 'web'
// use morgan to log requests to the console
app.use(morgan('dev'));
//Set the env PassJwt value
app.set('PassJwt', config.secret);
app.use(bodyParser.json());
app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

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
app.listen(app_port, app_bind_ip, function () {
    console.log('Example app listening on ' + app_bind_ip + ':' + app_port);
});
