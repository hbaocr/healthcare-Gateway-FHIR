const axios = require('axios');
class FHIRApi{
    constructor(host){
        if(host){
            this.host=host;
        }else{
            this.host = "http://127.0.0.1:3000/3_0_1/";
        }
       
        this.config = {
            headers: {
                'Content-Type': 'application/fhir+json',
                'Cache-Control': 'no-cache'
            }
        };
        this.FHIRservice={
            Patient:"patient",
            Organization:"organization",
            ImagingStudy:"imagingstudy"
        };
    }
    update_data_fhir(resource, json_data, id, options) {
        let host= this.host;
        let config = this.config;
        let FHIRservice = this.FHIRservice;
        let raw_body = json_data;
        let chk = resource.toLowerCase();
       
        let link="";
        if(id){
           link = host + chk + "/" + id;
        }else{
            let JsonObj = JSON.parse(json_data);
            link = host + chk + "/" + JsonObj.id;
        }
      
        switch (chk) {
            case FHIRservice.Patient:
            case FHIRservice.Organization:
            case FHIRservice.ImagingStudy:
                return axios.put(link, raw_body, config);
                break;
            default:
                let err_log="don't support service : "+ chk;
                console.log(err_log);
                return new Promise((resolve,reject)=>{
                    reject(err_log);
                });
        }
    }
    get_data_fhir(resource, id, options) {
        let host= this.host;
        let config = this.config;
        let FHIRservice = this.FHIRservice;
        //let raw_body = json_data;
        let chk = resource.toLowerCase();
        let link = host + chk + "/" + id;
        switch (chk) {
            case FHIRservice.Patient:
            case FHIRservice.Organization:
            case FHIRservice.ImagingStudy:
                return axios.get(link, config);
                break;
            default:
                let err_log="don't support service : "+ chk;
                console.log(err_log);
                return new Promise((resolve,reject)=>{
                    reject(err_log);
                });
        }
    }
    
    delete_data_fhir(resource, id, options) {
        let host= this.host;
        let config = this.config;
        let FHIRservice = this.FHIRservice;
        //let raw_body = json_data;

        let chk = resource.toLowerCase();
        raw_body = json_data;
        let link = host + chk + "/" + id;
        switch (chk) {
            case FHIRservice.Patient:
            case FHIRservice.Organization:
            case FHIRservice.ImagingStudy:
                return axios.delete(link, config);
                break;
            default:
                let err_log="don't support service : "+ chk;
                console.log(err_log);
                return new Promise((resolve,reject)=>{
                    reject(err_log);
                });
        }
    }
    search_data_fhir(resource, jsonSearchParas) {
        //http://127.0.0.1:3000/3_0_1/Patient/_search
        //raw_body={"gender": "orther"}
        let host= this.host;
        let config = this.config;
        let FHIRservice = this.FHIRservice;
        //let raw_body = json_data;

        let chk = resource.toLowerCase();
        let raw_body = jsonSearchParas;
        let link = host + chk + "/" + "_search";
        switch (chk) {
            case FHIRservice.Patient:
            case FHIRservice.Organization:
            case FHIRservice.ImagingStudy:
                return axios.post(link,raw_body,config);
                break;
            default:
                let err_log="don't support service : "+ chk;
                console.log(err_log);
                return new Promise((resolve,reject)=>{
                    reject(err_log);
                });
        }
    }   
    get_all_records(resource){
        return this.search_data_fhir(resource, {});
    }  
}
module.exports =FHIRApi;






