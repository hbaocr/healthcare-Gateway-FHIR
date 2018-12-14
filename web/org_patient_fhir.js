pragma solidity ^0.4.18;

contract FHIRServices{
    uint256 constant permsion_RW=0;
    uint256 constant permsion_RD=1;
    uint256 constant permsion_RJ=2;
    uint256 constant permsion_EX=3;
    uint256 constant permsion_NONE=4;//just recent created or don't want to change previous one;
    uint256 constant permsion_AL=5;//maximum number to check permsion valid or not.the setting permsion must be less then this value
    
    struct Info{
        address hash_msg;//ripemd160 of doc_data --> look like address
        address[] related_id;// the list of related docID or pID,or oID
        address created_by;
        uint256 permsion;
        uint256 expiredTime;
        string description;
        uint256 last_utc;
        uint256 idx;
    }
    struct Data{
         mapping(address=>Info) member_info;
         address[] member_list;
    }
    function is_data_available(Data storage _data,address _member_id) private view returns(bool is_available){
         if(_data.member_list.length == 0){
           return false;
       }
      return (_data.member_list[_data.member_info[_member_id].idx] == _member_id);
    }
    function insert(Data storage _data,address _member_id, Info _info) private {
        
         if(is_data_available(_data,_member_id)){
            //update new data
            _data.member_info[_member_id].hash_msg=_info.hash_msg;
            _data.member_info[_member_id].created_by=_info.created_by;
            _data.member_info[_member_id].permsion=_info.permsion;
            _data.member_info[_member_id].expiredTime=_info.expiredTime;
            _data.member_info[_member_id].description=_info.description;
            _data.member_info[_member_id].last_utc=_info.last_utc;
        }else{ 
            //create new records
            _data.member_info[_member_id].hash_msg=_info.hash_msg;
            _data.member_info[_member_id].created_by=_info.created_by;
            _data.member_info[_member_id].permsion=_info.permsion;
            _data.member_info[_member_id].expiredTime=_info.expiredTime;
            _data.member_info[_member_id].description=_info.description;
            _data.member_info[_member_id].last_utc=_info.last_utc;
            //create new list
            _data.member_info[_member_id].idx=_data.member_list.push(_member_id)-1;
        }    
    }
    
    function insert_related_id(Data storage _data,address _member_id,address _related_id) private returns(bool isSuccess){
         if(is_data_available(_data,_member_id)){
            _data.member_info[_member_id].related_id.push(_related_id);
            _data.member_info[_member_id].last_utc= block.timestamp;
            isSuccess= true;
         }else{
              isSuccess= false;
         }
    }
    function read(Data storage _data,address _member_id) private view returns(Info _ret){
        _ret=_data.member_info[_member_id];
    }
    function dtbsize(Data storage _data) private view returns(uint256 _ret){
        _ret=_data.member_list.length;
    }
    
    //========================THe code for smartcontract here=============================    
   
    address private owner;
    string  private owner_name;
    uint256 private fee=0; // this is update fee
    
    uint256 constant status_OK =       0;
    uint256 constant status_ERR =      1;
    uint256 constant status_REJECT   = 2;
    uint256 constant status_EXPIRED  = 3;

    Data  patient_list;//for regist
    Data  org_list;//for regist
    mapping(address=>Data) pat_allows;//patID-->Data[org_id].Info include permsion, expiredTime,last_utc
    mapping(address=>Data) pat_docIDs;//pat -->Data[_did]
    //mapping(address=>Data) org_patIDs;//org -->Data[patID]
    mapping(address=>Data) org_pat_dIDs;//org -->Data[patID].Info.related_id[did]
    
    event log_alarm_info(
       address indexed _fromsender,
       uint256 errcode,
       string info,
       address indexed _to,
       address ripemd160_hash
    );
    event log_list_id(
       address indexed _fromsender,
       uint256 errcode,
       string info,
       address indexed _to,
       address[] ripemd160_hash
    );
    
    function FHIRServices(string _name,uint256 _fee) public{
        owner = msg.sender;
        owner_name=_name;
        fee=_fee;//80000000000000
    }
     //change the owner of the service provider
    function change_owner(address _to,string _name) private {
        require(msg.sender==owner);
        owner = _to;
        owner_name=_name;
    }
    // withdraw  ETH from this service
    function withdraw(uint256 howmuch) public payable {
        if(msg.sender==owner){
           msg.sender.transfer(howmuch);
            log_alarm_info(msg.sender,status_OK,"service owner withdraw money",owner,0);
        }else{
            log_alarm_info(msg.sender,status_ERR,"Only owner can withdraw fee",owner,0);
        }
    }
    function set_fee(uint256 howmuch) public {
        if(msg.sender==owner){
            fee=howmuch;
            log_alarm_info(msg.sender,status_OK,"New fee Update",owner,0);

        }else{
            log_alarm_info(msg.sender,status_ERR,"Only owner can change the fee",owner,0);
        }
    }
    function get_fee() view public returns( uint256 v){
        return fee;
    }
  
    function pat_insert_info(string _name) public payable{
        if(msg.value < fee){
             log_alarm_info(msg.sender,status_ERR,"not enough fee",owner,0);
        }else{
             Info memory _info;
            _info.created_by = msg.sender;
            _info.last_utc=block.timestamp;
            _info.description=_name;
             insert( patient_list,msg.sender, _info);
             log_alarm_info(msg.sender,status_OK,"Insert/Update  Org",owner,0);
        }
       
    }
    function pat_get_info(address _pID) public view returns (string _name,uint256 _last_utc){
        Info memory _info = read(patient_list,_pID);
        _name=_info.description;
        _last_utc=_info.last_utc;
    }
    function pat_allow_org(address _oID,uint256 _permsion,uint256 _expiredTime) public{
        Info memory permsion_info;
        if(_permsion>permsion_AL){
            log_alarm_info(msg.sender,status_ERR,"Invalid permsion_info",owner,0);
            return;
        }
        permsion_info.permsion=_permsion;
        permsion_info.expiredTime=_expiredTime;
        permsion_info.last_utc=block.timestamp;
        insert(pat_allows[msg.sender],_oID,permsion_info);
        log_alarm_info(msg.sender,status_OK,"Set permision OK",owner,0);
    }
    function pat_get_all_org() public{
        address _pID = msg.sender;
        log_list_id(_pID,status_OK,"All Clinic ID",_pID,pat_allows[_pID].member_list);
    }
    function pat_get_all_did() public{
        address _pID = msg.sender;
        log_list_id(_pID,status_OK,"All Clinic ID",_pID,pat_docIDs[_pID].member_list);
    }
    
    function org_insert_info(string _name) public payable{
        if(msg.value < fee){
             log_alarm_info(msg.sender,status_ERR,"not enough fee",owner,0);
        }else{
             Info memory _info;
             
            _info.created_by = msg.sender;
            _info.last_utc=block.timestamp;
            _info.description=_name;
             
             insert( org_list,msg.sender, _info);
             log_alarm_info(msg.sender,status_OK,"Insert/Update  Org",owner,0);
        }
       
    }
    //if return empty --> not available
    function org_get_info(address _oID) public view returns (string _name,uint256 _last_utc){
        Info memory _info=read(org_list,_oID);
        _name=_info.description;
        _last_utc=_info.last_utc;
    }
    function org_get_all_pat() public{
        address _oID = msg.sender;
        log_list_id(_oID,status_OK,"All patient ID of Org",_oID,org_pat_dIDs[_oID].member_list);
    }
    function org_check_permission(address _oID,address _pID) public view returns(uint256 _permsion,uint256 _expiredTime){
       Info memory _org_per_info = read(pat_allows[_pID],_oID) ;
       _expiredTime=_org_per_info.expiredTime;
       if(_org_per_info.expiredTime < block.timestamp){
           _permsion=permsion_EX;
       }else{
           _permsion =_org_per_info.permsion;
       }
    }
    function org_insert_pat_did(address _pID,address _dID,string _description) payable public {
        if(msg.value <fee){
            log_alarm_info(msg.sender,status_ERR,"Not Enough Fee",owner,0);
            return;
        }
        if(is_data_available(patient_list,_pID)==false){
            log_alarm_info(msg.sender,status_ERR,"Patient not available",owner,0);
            return;
        }
         if(is_data_available(org_list,msg.sender)==false){
            log_alarm_info(msg.sender,status_ERR,"Org not available",owner,0);
            return;
        }     
        Info memory _info;
        _info.created_by = msg.sender;
        _info.last_utc=block.timestamp;
        insert(org_pat_dIDs[msg.sender],_pID,_info);
        insert_related_id(org_pat_dIDs[msg.sender],_pID,_dID);
        
        Info memory _docinfo;
        _docinfo.created_by=msg.sender;
        _docinfo.last_utc=block.timestamp;
        _docinfo.description=_description;
        _docinfo.permsion = permsion_NONE;
        _docinfo.hash_msg=_dID;
        insert(pat_docIDs[_pID],_dID,_docinfo);
        log_alarm_info(msg.sender,status_OK,"insert new document into system",owner,_dID);
      
    }
    function org_read_pat_did(address _oID,address _pID)public{
       uint256 _permsion;
       uint256 _expiredTime;
       (_permsion,_expiredTime)=org_check_permission(_oID,_pID);
       address[] memory tmp;
       if(_permsion==permsion_EX){
            log_list_id(msg.sender,status_ERR,"permsion_EX",owner,tmp);
           return;
       }
       if(_permsion==permsion_RD){
         log_list_id(msg.sender,status_OK,"permsion_RD",_pID,org_pat_dIDs[_oID].member_info[_pID].related_id); 
          return;
       }
       if(_permsion==permsion_AL){ //read all _dIDs include the _docID from orther orgs
          //return pat_docIDs[_pID].member_list;
            log_list_id(msg.sender,status_OK,"permsion_ALL",_pID,pat_docIDs[_pID].member_list) ; 
       }else{
            log_list_id(msg.sender,status_OK,"permsion_ALL",_pID,tmp) ; 
       }
    }
}