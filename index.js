//0x03400858AC313fBC9881D86e0dAA9c873f227E8e

var sigUtil = require('eth-sig-util');
var ethUtil = require('ethereumjs-util');
var mecrec_dapp = require('./med_contract_handler');
var fs = require('fs');
var express_app = require('./gateway_app_utils');
var MedcontractInfo = require("./contractInfo");

mecrec_dapp = new mecrec_dapp();
var web3 = mecrec_dapp.setup_web3_websocket();
var contract = mecrec_dapp.setup_smartcontract(web3);
var FHIR = require('./FhirApi');
var fhir_config = require('./config/fhir_config');
var FHIR_REC = require('./FhirRecords');
var fhir_app = new FHIR(fhir_config.server);
var fhir_record = new FHIR_REC();


function validiate_receipt(txid, _from, _to, _exp_blockgap) {

    var promise0 = web3.eth.getBlockNumber();
    var promise1 = new Promise((resolve, reject) => {
        mecrec_dapp.wait_for_receipt(web3, txid, 120, (err, ret) => {
            if (err) {
                reject(err);
            } else {
                resolve(ret);
            }
        })
    });
    return Promise.all([promise0, promise1])
        .then((rets) => {
            let c_blockcnt = rets[0];
            let receipt_blockcnt = rets[1].raw.blockNumber;
            let receipt_from = rets[1].raw.from;
            let receipt_to = rets[1].raw.to;
            let err = rets[1].receipt[0].events[1].value;
            if ((err == 0) && (receipt_from == _from) && (receipt_to == _to) && ((receipt_blockcnt - c_blockcnt) < _exp_blockgap)) {
                let result = {
                    isValid: true,
                    details: rets,
                }
                return Promise.resolve(result);
            } else {
                let result = {
                    isValid: false,
                    details: rets,
                }
                return Promise.resolve(result);
            }
        })
        .catch((err) => {
            return Promise.reject(err);
        })
}

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
app.post('/is_login_legit',async (req,resp)=>{
    let fhirtoken = req.cookies.fhirtoken;
    let pass = app.get('PassJwt');
    let is_login = await express_app.jwt_verify(fhirtoken, pass);
    resp.json({isValid:is_login});
});
app.post('/fhir_org_update', async (req, response) => {
    //let cookie = req.cookies;
    let fhirtoken = req.cookies.fhirtoken;
    let pass = app.get('PassJwt');
    let is_login = await express_app.jwt_verify(fhirtoken, pass);
    if (is_login) {
        let txid = req.body.txid;
        let org_inf = req.body.info;
        let from = req.body.from;
        validiate_receipt(txid, from, MedcontractInfo.address, 20).then((ret) => {
            if (ret.isValid) {
                let web_url = req.path;
                let desc={
                    info:'this is test Infomation of Orgs. And can be more details',
                    desc:org_inf,
                    contract:MedcontractInfo.address
                }
                let div_str = JSON.stringify(desc);
                let rec = fhir_record.create_org_json_info(from, org_inf, web_url, "test@abc.com", "+84.9878987913", "Dist1 NguyenDu", div_str);
                fhir_app.update_data_fhir(fhir_app.FHIRservice.Organization, rec).then((ret) => {
                    console.log('Update org OK');
                    let r={
                        isValid: true,
                        msg:'valid txid',
                        details: ret,
                    }
                    response.json(r);
                })
            } else {
                let r={
                    isValid: false,
                    msg:'invalid txid',
                    details: ret,
                }
                console.log('Invalid Txid');

                response.json(r);
            }
        })
        .catch((err) => {
            let r={
                isValid: false,
                msg:'request error',
                details: err,
            }
            response.json(r);
            console.error(err);
        })
    } else {
        let r={
            isValid: false,
            msg:'Expired Time--> Try to Authen Again',
            details: '',
        }
        console.error('fhir_org_update-->cookies error');
    }

})
app.post('/fhir_org_insert_patient',async (req, response)=>{

})


