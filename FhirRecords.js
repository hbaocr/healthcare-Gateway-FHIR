var org_json_template=require("./fhir_client/org-jsontemplate");
var patient_json_template= require("./fhir_client/patient-jsontemplate");
var imageStudy_json_template=require("./fhir_client/ImageStudy-jsontemplate");
// let org_str=
// create_org_json_info("12345","hostpitalA","http://www.hostpitalA.org","contact@HosptialA.org","+8490830198480"," LVA street ward10")

// console.log(org_str);

// let pat_str = create_patient_json_info("312","fam","john","male","090742058205","jlafjl@jlajg","117 nguyendu","12345","wwww.hosta.org","hostA")
// console.log(pat_str);

// let img_str=create_imageStudy_json_info("123","12345","1231");
// console.log(img_str);
class FhirRecord{
    constructor(){

    };
    create_org_json_info(id,name,web_url,mail,phone_num,addr,div_str){
        // let div_str="<div xmlns=\"http://www.w3.org/1999/xhtml\">\n      \n"+ 
        //             "<p> HosptialA. tel:"+ phone_num+ ", email: \n"+
        //             "<a href=\"mailto:"+mail+"\">"+mail+"</a>\n      </p>\n    \n </div>";
    
        let org = org_json_template;
        org.id= ""+id;
        org.text.div=div_str;
        org.identifier[0].system=web_url;
        org.identifier[0].value=id;
        org.name=name;
        org.telecom[0].value=""+phone_num;
        org.telecom[1].value=""+mail;
        org.address.line[0]=""+addr;
        return JSON.stringify(org);
    }
    ////gender : male/female/other
    create_patient_json_info(id,family_name,given_name,gender,phone_num,mail,addr,org_id,org_url,org_name,div_str,isActive=true){
        // let div_str= "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n      \n      <p>Patient "+
        //              given_name+" "+family_name+ " @ "+org_name+"  MR = "+id+"</p>\n    \n    </div>";
    
        let pat = patient_json_template;
        pat.id= ""+id;
        pat.text.div=div_str;
    
        pat.identifier[0].system=org_url;
        pat.identifier[0].value=id;
        if(isActive){
            pat.active=true;
        }else{
            pat.active=false;
        }
        
        pat.name[0].family=family_name;
        pat.name[0].given[0]=given_name;
        pat.gender=gender;
    
        pat.telecom[0].value=""+phone_num;
        pat.telecom[1].value=""+mail;
        pat.address.line[0]=""+addr;
    
        pat.managingOrganization.reference="Organization/"+org_id;
        pat.managingOrganization.display=org_name;
        return JSON.stringify(pat);
    }
    create_imageStudy_json_info(img_id,pat_id,org_id,div_str){
        let img = imageStudy_json_template;
        img.text.div=div_str;//"<div xmlns=\"http://www.w3.org/1999/xhtml\">CT images</div>"
        img.id=""+img_id;
        img.patient.reference="Patient/"+pat_id;
        img.accession.assigner.reference="Organization/"+org_id;
        img.accession.value =org_id;
        img.started= new Date().toDateString();
        img.endpoint[0].reference="Endpoint/"+img_id;
        return JSON.stringify(img);
    }
    

}
module.exports =FhirRecord;
