module.exports = {
    msg_signed: "Healthcare Signature",
    networdID:'122018',
    block_interval: 100, // for signing change each interval of block ( 100 block signature change) 
    address: "0x8efd0363f5764b8b52463ec0a420731f9c81c3a3",
    abi: [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_to",
                    "type": "address"
                },
                {
                    "name": "_name",
                    "type": "string"
                }
            ],
            "name": "changeOwnerService",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_patID",
                    "type": "address"
                },
                {
                    "name": "_did",
                    "type": "uint256"
                },
                {
                    "name": "_description",
                    "type": "string"
                }
            ],
            "name": "orgUpdatePatientDocument",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_orgId",
                    "type": "address"
                },
                {
                    "name": "_permission",
                    "type": "uint256"
                },
                {
                    "name": "expired_utc_time",
                    "type": "uint256"
                }
            ],
            "name": "patientApproveOrgsPermission",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "howmuch",
                    "type": "uint256"
                }
            ],
            "name": "setFee",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_orgName",
                    "type": "string"
                }
            ],
            "name": "updateOrgRegisterInfo",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "_description",
                    "type": "string"
                }
            ],
            "name": "updatePatientsRegisterInfo",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "howmuch",
                    "type": "uint256"
                }
            ],
            "name": "withdraw",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "name": "_name",
                    "type": "string"
                },
                {
                    "name": "_fee",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_fromsender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "errcode",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "info",
                    "type": "string"
                },
                {
                    "indexed": true,
                    "name": "_to",
                    "type": "address"
                }
            ],
            "name": "alarmInfo",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_fromsender",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_target",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "addrs",
                    "type": "address[]"
                },
                {
                    "indexed": false,
                    "name": "errcode",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "info",
                    "type": "string"
                }
            ],
            "name": "logReturnAddr",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "_fromsender",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "_target",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "_dids",
                    "type": "uint256[]"
                },
                {
                    "indexed": false,
                    "name": "errcode",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "name": "info",
                    "type": "string"
                }
            ],
            "name": "logReturnDocID",
            "type": "event"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_ordID",
                    "type": "address"
                },
                {
                    "name": "_patID",
                    "type": "address"
                }
            ],
            "name": "checkPermissionOfOrgsWithPatient",
            "outputs": [
                {
                    "name": "status",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getAllOrgs",
            "outputs": [
                {
                    "name": "oIds",
                    "type": "address[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getAllPatients",
            "outputs": [
                {
                    "name": "pids",
                    "type": "address[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getFee",
            "outputs": [
                {
                    "name": "v",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_orgID",
                    "type": "address"
                }
            ],
            "name": "getOrgName",
            "outputs": [
                {
                    "name": "n",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getPatientsOfOrg",
            "outputs": [
                {
                    "name": "pids",
                    "type": "address[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_orgID",
                    "type": "address"
                }
            ],
            "name": "isOrgAvailable",
            "outputs": [
                {
                    "name": "isOk",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_patId",
                    "type": "address"
                }
            ],
            "name": "isPatAvailable",
            "outputs": [
                {
                    "name": "isOK",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_patId",
                    "type": "address"
                },
                {
                    "name": "_did",
                    "type": "uint256"
                }
            ],
            "name": "isPatientDocAvailable",
            "outputs": [
                {
                    "name": "isOK",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_patID",
                    "type": "address"
                }
            ],
            "name": "orgGetPatientsDocument",
            "outputs": [
                {
                    "name": "_did",
                    "type": "uint256[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "_patID",
                    "type": "address"
                }
            ],
            "name": "orgGetPatientsDocumentIsReadable",
            "outputs": [
                {
                    "name": "status",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "patientGetDesc",
            "outputs": [
                {
                    "name": "v",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        }
    ]
}