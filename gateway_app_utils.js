var cors = require('cors');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var config = require("./config/config");
var express = require('express');
var fs = require('fs');
var MedcontractInfo = require("./contractInfo");


module.exports = {
    setup: (app_ex) => {

        let app;

        if (app_ex) {
            app = app_ex;
        } else {
            app = express();
        }
        app.use("/", express.static(__dirname + '/web'));//mount root of web to 'web'

        let ret = "MedcontractInfo = " + JSON.stringify(MedcontractInfo);
        let pathcontract = __dirname + '/web' + '/contract_config.js';
        console.log('sync up smartcontract setup to web app at  : ', pathcontract);
        fs.writeFileSync(pathcontract, ret);

        // use morgan to log requests to the console
        app.use(morgan('dev'));
        //Set the env PassJwt value
        app.set('PassJwt', config.secret);
        app.use(bodyParser.json());
        app.use(cookieParser());
        // parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({ extended: true }));
        return app;
    },
    begin: (app, app_bind_ip, app_port) => {
        if (app) {
            this.app_port = app_port;
            this.app_bind_ip = app_bind_ip;
            app.listen(app_port, app_bind_ip, function () {
                console.log('Example app listening on ' + app_bind_ip + ':' + app_port);
            });
        } else {
            console.log('No express app ' + app_bind_ip + ':' + app_port);
        }
    },
    generate_contract_info_to_webjs: () => {
        let ret = "MedcontractInfo = " + JSON.stringify(MedcontractInfo);
        let pathcontract = __dirname + '/web' + '/contract_config.js';
        console.log('sync up smartcontract setup to web at  : ', pathcontract);
        fs.writeFileSync(pathcontract, ret);
    },
    jwt_sign: (payload, pass, expire_sec = 1440) => {
        var _token = jwt.sign(payload, pass, {
            expiresIn: expire_sec // expires in 24 hours
        });
        return _token;
    },
    jwt_verify: (token, pass) => {
        return new Promise((resolve, reject) => {
            if (token) {
                jwt.verify(token, pass, (err, decoded) => {
                    if (err) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            } else {
                resolve(false);
            }
        })


    }


}