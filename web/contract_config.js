MedcontractInfo = {"msg_signed":"Healthcare Signature","networdID":"122018","gateway_host":"http://127.0.0.1:8080","fhir_api":"http://127.0.0.1:3000/3_0_1","block_interval":100,"_gasLimit":1500000,"_gasPrice":"20000000000","address":"0x85ba770ad387a5b094fcb3abbc96448bc3550141","abi":[{"constant":false,"inputs":[],"name":"org_get_all_pat","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xca34475e"},{"constant":false,"inputs":[{"name":"_name","type":"string"}],"name":"org_insert_info","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0x4c449943"},{"constant":false,"inputs":[{"name":"_pID","type":"address"},{"name":"_dID","type":"address"},{"name":"_description","type":"string"}],"name":"org_insert_pat_did","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0xee41a31e"},{"constant":false,"inputs":[{"name":"_oID","type":"address"},{"name":"_pID","type":"address"}],"name":"org_read_pat_did","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xd9149c84"},{"constant":false,"inputs":[{"name":"_oID","type":"address"},{"name":"_permsion","type":"uint256"},{"name":"_expiredTime","type":"uint256"}],"name":"pat_allow_org","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x56aebbe2"},{"constant":false,"inputs":[],"name":"pat_get_all_did","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x98e0830b"},{"constant":false,"inputs":[],"name":"pat_get_all_org","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x4c9a69c3"},{"constant":false,"inputs":[{"name":"_name","type":"string"}],"name":"pat_insert_info","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0x83732b92"},{"constant":false,"inputs":[{"name":"howmuch","type":"uint256"}],"name":"set_fee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x1aa02d59"},{"constant":false,"inputs":[{"name":"howmuch","type":"uint256"}],"name":"withdraw","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0x2e1a7d4d"},{"inputs":[{"name":"_name","type":"string"},{"name":"_fee","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_fromsender","type":"address"},{"indexed":false,"name":"errcode","type":"uint256"},{"indexed":false,"name":"info","type":"string"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"ripemd160_hash","type":"address"}],"name":"log_alarm_info","type":"event","signature":"0xa79616ce5e408b006d83a816fa5aae382126822b4f23dd238bf583e350be0742"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_fromsender","type":"address"},{"indexed":false,"name":"errcode","type":"uint256"},{"indexed":false,"name":"info","type":"string"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"ripemd160_hash","type":"address[]"}],"name":"log_list_id","type":"event","signature":"0x2464825988d98cde4d0ae3a57f8950ecce0fe6e89f3383d8f2075b9a5a8816a8"},{"constant":true,"inputs":[],"name":"get_fee","outputs":[{"name":"v","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x64af47cf"},{"constant":true,"inputs":[{"name":"_oID","type":"address"},{"name":"_pID","type":"address"}],"name":"org_check_permission","outputs":[{"name":"_permsion","type":"uint256"},{"name":"_expiredTime","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x42b41612"},{"constant":true,"inputs":[{"name":"_oID","type":"address"}],"name":"org_get_info","outputs":[{"name":"_name","type":"string"},{"name":"_last_utc","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xec8f9dfb"},{"constant":true,"inputs":[{"name":"_pID","type":"address"}],"name":"pat_get_info","outputs":[{"name":"_name","type":"string"},{"name":"_last_utc","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x34688d3e"}]}