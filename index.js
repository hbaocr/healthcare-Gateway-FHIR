//0xb05a9272fdf033c83758339f37a0290ed65707cf
//0x7711b9b74abeec38f4afae884f9238dc6de971f2
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
express_app.begin(app, "0.0.0.0", MedcontractInfo.web_port);

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
app.post('/is_login_legit', async (req, resp) => {
    let fhirtoken = req.cookies.fhirtoken;
    let pass = app.get('PassJwt');
    let is_login = await express_app.jwt_verify(fhirtoken, pass);
    resp.json({ isValid: is_login });
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
                let desc = {
                    info: 'this is test Infomation of Orgs. And can be more details',
                    desc: org_inf,
                    contract: MedcontractInfo.address
                }
                let div_str = JSON.stringify(desc);
                let rec = fhir_record.create_org_json_info(from, org_inf, web_url, "test@abc.com", "+84.9878987913", "Dist1 NguyenDu", div_str);
                fhir_app.update_data_fhir(fhir_app.FHIRservice.Organization, rec).then((ret) => {
                    console.log('Update ORG .....');
                    let r = {
                        isValid: true,
                        msg: 'valid txid',
                        details: ret,
                    }
                    if ((ret.status == 200) || (ret.status == 201)) {
                        r.isValid = true;
                    } else {
                        r.isValid = false;
                    }
                    response.json(r);
                })
            } else {
                let r = {
                    isValid: false,
                    msg: 'invalid txid',
                    details: ret,
                }
                console.log('Invalid Txid');

                response.json(r);
            }
        })
            .catch((err) => {
                let r = {
                    isValid: false,
                    msg: 'request error',
                    details: err,
                }
                response.json(r);
                console.error(err);
            })
    } else {
        let r = {
            isValid: false,
            msg: 'Expired Time--> Try to Authen Again',
            details: '',
        }
        response.json(r);
        console.error('fhir_org_update-->cookies error');
    }

})
//insert DID
app.post('/fhir_org_insert_patient', async (req, response) => {
    //let cookie = req.cookies;
    let fhirtoken = req.cookies.fhirtoken;
    let pass = app.get('PassJwt');
    let is_login = await express_app.jwt_verify(fhirtoken, pass);
    if (is_login) {
        let txid = req.body.txid;
        let _report = req.body.info;
        let from = req.body.from;
        let _did = req.body.did;
        let _patid = req.body.patID;
        validiate_receipt(txid.toLowerCase(), from.toLowerCase(), MedcontractInfo.address.toLowerCase(), 20).then((ret) => {
            if (ret.isValid) {
                let web_url = req.path;
                let desc = {
                    info: 'this is test Report of Patient. And can be more details',
                    report: _report,
                    contract: MedcontractInfo.address
                }

                let div_str = JSON.stringify(desc);
                let rec = fhir_record.create_imageStudy_json_info(_did, _patid, from, div_str);
                fhir_app.update_data_fhir(fhir_app.FHIRservice.ImagingStudy, rec).then((ret) => {
                    console.log('Update Images..... ' + _did);
                    let r = {
                        isValid: true,
                        msg: 'valid txid',
                        details: ret,
                    }
                    if ((ret.status == 200) || (ret.status == 201)) {
                        r.isValid = true;
                    } else {
                        r.isValid = false;
                    }
                    response.json(r);
                })
            } else {
                let r = {
                    isValid: false,
                    msg: 'invalid txid',
                    details: ret,
                }
                console.log('Invalid Txid');

                response.json(r);
            }
        })
            .catch((err) => {
                let r = {
                    isValid: false,
                    msg: 'request error',
                    details: err,
                }
                response.json(r);
                console.error(err);
            })
    } else {
        let r = {
            isValid: false,
            msg: 'Expired Time--> Try to Authen Again',
            details: '',
        }
        response.json(r);
        console.error('fhir_org_update-->cookies error');
    }
})
//read DID
app.post('/fhir_org_read_pat_did', async (req, response) => {

    //let cookie = req.cookies;
    let fhirtoken = req.cookies.fhirtoken;
    let pass = app.get('PassJwt');
    let is_login = await express_app.jwt_verify(fhirtoken, pass);
    if (is_login) {
        let _txid = req.body.txid;
        let _from = req.body.from;
        let _did = req.body.did;
        let _patid = req.body.patID;
        let max_block_delay=50;
        let r = {
            isValid: false,
            msg: 'invalid valid txid',
            details: '',
        }
        validiate_receipt(_txid.toLowerCase(), _from.toLowerCase(),MedcontractInfo.address.toLowerCase(), max_block_delay).then((ret) => {
            if (ret.isValid) {
                let _receipt=ret.details[1].receipt[0];
                if(_receipt.events[1].value ==0){ //valid receipt
                    if(_patid.toLowerCase()==_receipt.events[3].value.toLowerCase()){ //valid _patID
                        let _didArray =_receipt.events[4].value;
                        let len=_didArray.length;
                        let promiseArray=[];
                        if(len<=0){
                            r.msg='There are no records return';
                            r.isValid=false;
                        }else{
                            //hbaocr here---> continue with error on promise with some thing wrong on the middle of process
                            //---> try to sove promise with separate catch error
                            for(let i=len-1;i>=0;i--){
                                let _did=_didArray[i];
                                //if err then catch and log to console
                                let promise = fhir_app.get_data_fhir(fhir_app.FHIRservice.ImagingStudy,_did).catch((err)=>{
                                    //console.error('-------------------------This Doc not available--------------------------------------');
                                    //console.error(err);
                                    //console.error('-------------------------------------------------------------------------------------');

                                });
                                promiseArray.push(promise);
                            }
                            return Promise.all(promiseArray);
                        }
            
                    }else{
                        r.msg='Invalid target patient = '+_patid.toLowerCase();
                        r.isValid=false;
                    }
                }else{
                    r.msg='Invalid Receipt. Error code = '+_receipt.events[1].value;
                    r.isValid=false;
                }

                response.json(r);
            } else {
                r.msg='Invalid Receipt';
                r.isValid=false;
                console.error('Invalid Txid');
                response.json(r);
            }
        })
        .then((_didResp)=>{
            let report_docs= _didResp.map((fhir_rec)=>{
                if(fhir_rec){
                    if(fhir_rec.status==200){
                        let _doc={
                            meta:fhir_rec.data.meta,
                            patient:fhir_rec.data.patient.reference,
                            org:fhir_rec.data.accession.assigner.reference,
                            report:fhir_rec.data.text.div,
                        }
                        return _doc;
                    }
                }
            })
            let resp = {
                isValid: true,
                msg: 'Success to get FHIR documents',
                details: report_docs,
            }
            response.json(resp);
            console.log('---> success to get report');
        })
        .catch((err) => {
                let r = {
                    isValid: false,
                    msg: 'request error',
                    details: err,
                }
                response.json(r);
                console.error(err);
            })
    } else {
        let r = {
            isValid: false,
            msg: 'Expired Time--> Try to Authen Again',
            details: '',
        }
        response.json(r);
        console.error('fhir_org_update-->cookies error');
    }
})

app.post('/fhir_pat_update', async (req, response) => {
    //let cookie = req.cookies;
    let fhirtoken = req.cookies.fhirtoken;
    let pass = app.get('PassJwt');
    let is_login = await express_app.jwt_verify(fhirtoken, pass);
    if (is_login) {
        let txid = req.body.txid;
        let pat_inf = req.body.info;
        let from = req.body.from;
        validiate_receipt(txid, from, MedcontractInfo.address, 20).then((ret) => {
            if (ret.isValid) {
                let web_url = req.path;
                let desc = {
                    info: 'this is test Infomation of patients. And can be more details',
                    desc: pat_inf,
                    contract: MedcontractInfo.address
                }
                let div_str = JSON.stringify(desc);
                //let rec = fhir_record.create_org_json_info(from, pat_inf, web_url, "test@abc.com", "+84.9878987913", "Dist1 NguyenDu", div_str);
                let rec = fhir_record.create_patient_json_info(from,"test_fname","test_gname","test_gender","xx.xxxxxx","patient@test.com","Nguyen Du-Dist1",from,"www.patientstorage.app.endpoint.com","org my self",div_str);
                
                fhir_app.update_data_fhir(fhir_app.FHIRservice.Patient, rec).then((ret) => {
                    console.log('Patient updating.....');
                    let r = {
                        isValid: true,
                        msg: 'valid txid',
                        details: ret,
                    }
                    if ((ret.status == 200) || (ret.status == 201)) {
                        r.isValid = true;
                    } else {
                        r.isValid = false;
                    }
                    response.json(r);
                })
            } else {
                let r = {
                    isValid: false,
                    msg: 'invalid txid',
                    details: ret,
                }
                console.log('Invalid Txid');

                response.json(r);
            }
        })
            .catch((err) => {
                let r = {
                    isValid: false,
                    msg: 'request error',
                    details: err,
                }
                response.json(r);
                console.error(err);
            })
    } else {
        let r = {
            isValid: false,
            msg: 'Expired Time--> Try to Authen Again',
            details: '',
        }
        response.json(r);
        console.error('fhir_pat_update-->cookies error');
    }
})
