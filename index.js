

var sigUtil = require('eth-sig-util');
var ethUtil = require('ethereumjs-util');
var mecrec_dapp = require('./med_contract_handler');
var fs = require('fs');
var express_app = require('./gateway_app_config');
var MedcontractInfo = require("./contractInfo");
var web3 = mecrec_dapp.setup_web3_websocket();
var FHIR = require('./FhirApi');
var fhir_config = require('./config/fhir_config');
var FHIR_REC = require('./FhirRecords');

var fhir_app = new FHIR(fhir_config.server);
var fhir_record = new FHIR_REC();

setInterval(async () => {
    let cnt = await web3.eth.getBlockNumber();
    console.log('block cnt :', cnt);
}, 10000);
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
                    console.error('--verify invalid---addr:verify->' + verifying_addr + ' : ' + recovered);
                    reject();
                }
            })
    });

}
var app = express_app.setup();
express_app.begin(app, "0.0.0.0", 8000);
app.post('/jwt_authen', function (req, res) {
    let msg_signed = MedcontractInfo.msg_signed;
    let sig = req.body.signed;
    let addr = req.body.account;
    verify_signature(msg_signed, sig, addr).then((payload) => {
        let pass = app.get('PassJwt');
        var _token = express_app.jwt_sign(payload, pass, 1440);//1 day(24*60)
        let valid_time_ms = 15 * 60 * 1000;// 15 min
        let cookies_opt = {
            maxAge: valid_time_ms,
            overwrite: true,//whether to overwrite previously set cookies of the same name (false by default)
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

app.post('/fhir_org_update', async (req, res) => {
    let cookie = req.cookies;
    let fhirtoken = req.cookies.fhirtoken;
    let pass = app.get('PassJwt');
    let is_login = await express_app.jwt_verify(fhirtoken, pass);
    if (is_login) {
        let web_url = fhir_config.server;
        let div_str = "hello 1 234";
        let rec = fhir_record.create_org_json_info("test1234", "test_name", web_url, "test@abc.com", "+84.9878987913", "Dist1 NguyenDu", div_str);
        fhir_app.update_data_fhir(fhir_app.FHIRservice.Organization,rec).then((res)=>{
            console.log(res);
        })
    }else{
        console.error('fhir_org_update-->cookies error');
    }

})



