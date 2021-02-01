/* global Y */
'use strict'
const confReseller = require("./config/reseller");
let resellerclub = confReseller.resellerclub;
let url_reseller = confReseller.url_reseller;
var utils= require('../utils');



const CoCreateBase = require("../../core/CoCreateBase");
//const {ObjectID, Binary} = require("mongodb");

class CoCreateDomain extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('domain',		(socket, data) => this.sendDomain(socket, data));
		}
	}
	async sendDomain(socket, data) {
	    let that = this;
	    console.log("REqust in Domain")
        let data_original = {...data};
        let type = data['type'];
        let type_origin = data['type'];
        let domainName = '';
        //delete data['type'];
        let url = '';
        let method = '';
        let send_response ='domain';
        let isDelete = (type.indexOf('Delete') != -1);
        // type = type.substr(0,type.indexOf( (type.indexOf('Delete') !=-1 ) ? 'RecordDeleteBtn' : 'RecordBtn')).toLowerCase();
        
        // get type for transer, search, ...
        if (type.indexOf('Record') !== -1)
        type = type.substr(0, type.indexOf('Record')).toLowerCase();

        //delete first point to class
        //type = type.substr(1);
        console.log("Type ",type)
        console.log("DATA ORIGIN ",data)
        //dataToSend 
        data = {'type':data_original['type'] ,...data_original["data"]}
        let data_response = {'type':type_origin ,'response':data_original["data"]}
        //{ "type": type, "response": data }
        console.log("=Type ",type)
        switch (type) {
            case 'executeAction':
                console.log(" data_response ",data_response)
                utils.send_response(that.wsManager,socket,data_response,send_response)
            break;
            case 'txt':
            case 'mx':
            case 'cname':
            case 'ipv4':
            case 'ipv6':
            case 'svr':
            case 'ns':
                resellerclub
                  	.dnsRecord({ opt : type,  options : data , extra_options: { url_api: url_reseller } })
                  	.then(result => {
                  	    result["type"] = type;
                    		console.log("resulto bien la peticion ",result)
                    		data_response['result'] = result
                    		utils.send_response(that.wsManager,socket,data_response,send_response)
                  	})
                  	.catch(err => {
                  	    let result = {'type':type,'error':err};
                  	    console.log("Error ",type)
                  	    data_response['result'] = result
                    	utils.send_response(that.wsManager,socket,data_response,send_response)
                  	})
                break;
            case "customer":
                let customer_id = data['id_customer'];
                delete data['type'];
                delete data['id_customer'];
                console.log("isDelete",isDelete,customer_id)
                if (!isDelete) {
                    if (customer_id != "" && typeof(customer_id) != 'undefined') {
                        resellerclub.editCustomer({customerId:customer_id, customerDetails:data, extra_options : { url_api: url_reseller }})
                            .then(result => {
                          	    let res = {'type':type , result :  true,response : result,'data_request':data_original};
                            		console.log("edit_customer ok")
                            		utils.send_response(that.wsManager,socket,res,send_response)
                          	})
                            .catch(err => {
                          	    let result = {result :  false,response : err,'data_request':data_original,'type':type}
                          	    console.log("Error1 ")
                              	utils.send_error(that.wsManager,socket,result,send_response)
                          	});
                    } else {
                        resellerclub.createCustomer({ customerDetails : data, extra_options : { url_api: url_reseller } })
                            .then(result => {
                                let res = {'type':type ,'action':'add', result :  true,response : result,'data_request':data_original};
                            		console.log("create_customer ok")
                            		utils.send_response(that.wsManager,socket,res,send_response)
                          	})
                    	      .catch(err => {
                    	          console.log(err)
                          	    let result = {result :  false,response : err,'data_request':data_original,'type':type,'action':'add'}
                          	    console.log("create_customer error ")
                              	utils.send_error(that.wsManager,socket,result,send_response)
                          	})
                    }
                } else {
                    resellerclub.deleteCustomer({customerId:customer_id, extra_options : { url_api: url_reseller } })
                        .then(result => {
                    	    let res = {'type':type , result :  true,response : result,'data_request':data_original};
                        		console.log("delete_customer ok")
                        		utils.send_response(that.wsManager,socket,res,send_response)
                    	})
                        .catch(err => {
                    	    let result = {result :  false,response : err,'data_request':data_original,'type':type}
                    	    console.log("Error4 ")
                        	utils.send_error(that.wsManager,socket,result,send_response)
                    	});
                }
                break;
            case "contact":
                console.log("!Create Contact Switch")
                let contact_id = data['id_contact'];
                data['customer-id'] = data.customer_id;
                data['type'] = data['contact_type'];
                delete data['contact_type'];
                delete data['id_contact'];
                delete data['customer_id'];
                if (!isDelete) {
                  if (contact_id != "" && typeof(contact_id) != 'undefined'){
                    resellerclub.editContact({contactId:contact_id, contactDetails:data, extra_options : { url_api: url_reseller }})
                        .then(result => {
                      	    let res = {'type':type ,'action':'add', result :  true,response : result,'data_request':data_original};
                        		console.log("edit_contact ok")
                        		utils.send_response(that.wsManager,socket,res,send_response)
                      	})
                        .catch(err => {
                      	    let result = {result :  false,response : err,'data_request':data_original,'type':type,'action':'add'}
                      	    console.log("Error1 ")
                          	utils.send_error(that.wsManager,socket,result,send_response)
                      	});
        
                  } else {
                      console.log("!Create Contact")
                      resellerclub.createContact({ contactDetails : data, extra_options : { url_api: url_reseller } })
                        .then(result => {
                            let res = {'type':type ,'action':'add', result :  true,response : result,'data_request':data_original};
                        		console.log("create_contact ok")
                        		utils.send_response(that.wsManager,socket,res,send_response)
                      	})
                	      .catch(err => {
                	          console.log(type)
                	          console.log(err)
                      	    let result = {result :  false,response : err,'data_request':data_original,'type':type,'action':'add'}
                      	    console.log("create_contact error ")
                          	utils.send_error(that.wsManager,socket,result,send_response)
                      	})
                  }
                } else {
                  resellerclub.deleteContact({contactId:contact_id, extra_options : { url_api: url_reseller } })
                      .then(result => {
                    	    let res = {'type':type ,'action':'add', result :  true,response : result,'data_request':data_original};
                        		console.log("delete_contact ok")
                        		utils.send_response(that.wsManager,socket,res,send_response)
                    	})
                      .catch(err => {
                    	    let result = {result :  false,response : err,'data_request':data_original,'type':type,'action':'add'}
                    	    console.log("Error4 ")
                        	utils.send_error(that.wsManager,socket,result,send_response)
                    	});
                }
                    
                break;
            case "register":
                domainName = data['domain-name'];
                data['ns'] = (typeof(data['ns'])!='undefined') ? data['ns'].split(',') : [];
                
                
                resellerclub.register({ domainName, options:data, extra_options : { url_api: url_reseller } })
                    .then(result => {
                        let result_return = (Object.keys(result).indexOf('status') != -1 && ['error','ERROR'].indexOf(result['status'])!=-1 ) ? false : true;
                        let res = {'type':type , result :  result_return,response : result,'data_request':data_original};
                        console.log("register_domain ok")
                        utils.send_response(that.wsManager,socket,res,send_response)
                    })
                    .catch(err => {
                        let result = {result :  false,response : err,'data_request':data_original,'type':type}
                        utils.send_error(that.wsManager,socket,result,send_response)
                    });
                console.log("Final Request");
                break;
            case "search":
                resellerclub.searchDomain({options : data, count: data['no-of-records'], page: data['page-no'], extra_options : { url_api: url_reseller } })
                    .then(result => {
                        let res = {'type':type , result :  true,response : result,'data_request':data_original};
                      	console.log("search_domain ok")
                      	utils.send_response(that.wsManager,socket,res,send_response)
                    })
                    .catch(err => {
                        let result = {result :  false,response : err.data,'data_request':data_original,'type':type}
                        console.log("search_domain error")
                    	utils.send_error(that.wsManager,socket,result,send_response)
                    });
                console.log("Final Request");
                break;
            case "checktransfer":
                let domainCheckTransfer = data['domain-name'];
                resellerclub
                	.validateTransfer({domain : domainCheckTransfer,extra_options: { url_api: url_reseller }})
                	.then(result => {
                	    let result_return = (Object.keys(result).indexOf('status') != -1 && ['error','ERROR'].indexOf(result['status'])!=-1 ) ? false : true;
                		console.log("resulto bien la peticion "+result)
                		let res = {'type':type , result :  result_return,response : result,'data_request':data_original};
                		utils.send_response(that.wsManager,socket,res,send_response)
                	})
                	.catch(err => {
                		 let result = {result :  false,response : err.data,'data_request':data_original,'type':type}
                        console.log("check  error")
                    	utils.send_error(that.wsManager,socket,result,send_response)
                	})
            break;
            case "transfer":
                let domain = data['domain-name'];
                resellerclub.transfer({ domain:domain, options:data, extra_options : { url_api: url_reseller }  })
                    .then(result => {
                        let res = {'type':type , result :  true,response : result,'data_request':data_original};
                      	console.log("transfer_domain ok")
                      	utils.send_response(that.wsManager,socket,res,send_response)
                    })
                    .catch(err => {
                        let result = {result :  false,response : err.data,'data_request':data_original,'type':type}
                        console.log("transfer_domain error")
                    	utils.send_error(that.wsManager,socket,result,send_response)
                    });
                console.log("Final Request");
                break;
            case 'searchdomain':
                let tlds_list = ["company","business","com", "net", "biz", "tk","org","club","site","info","online","xyz"];
                domainName = data['domain-name']
            	let tlds = data['tlds[]']
            	tlds_list = validationForm( (typeof tlds != 'undefined' && tlds.length > 0) ? tlds : tlds_list,domainName);
            	console.log("tlds ",tlds_list)
                var allPricing = await resellerclub.getResellerCostPricing({extra_options: { url_api: url_reseller }});
            	resellerclub
            	.checkAvailability({ domainName: domainName, tlds: tlds_list , suggestAlternatives: true})
            	.then(res_reseller => {
            		let $data = getDomainsPrice(allPricing,res_reseller)
            		let $domainUnAvaibles = []
            		let $domainAvaibles = []
            		for(var tld in tlds_list){
            	    	let $domain={};
            	        let $fulldomainname = domainName + "." + tlds_list[tld];
            	        let row = getElementFromArray($data, $fulldomainname);
            	        $domain['name'] = $fulldomainname;
            	        $domain['status'] = row[$fulldomainname]['status'];
            	        $domain['price'] = typeof row[$fulldomainname]['price'] != 'undefined' ? row[$fulldomainname]['price'] : null;
            	        $domain['test'] = {'hey': {'name': 'test with frankie pagan'}}
            	        if($domain['status'] == 'available')
            	        	$domainAvaibles.push($domain);
            	        else
            	        	$domainUnAvaibles.push($domain);
            	    }
        	  	    let res = {'type':type , result :  true,response : $domainUnAvaibles.concat($domainAvaibles),'data_request':data_original};
                    console.log("search_domain ok")
                    utils.send_response(that.wsManager,socket,res,send_response)
            	})
            	.catch(err => {
            		console.log(err)
            		let result = {result :  false,response : err.data,'data_request':data_original,'type':type}
                    console.log("transfer_domain error")
                	utils.send_error(that.wsManager,socket,result,send_response);
            		});
                break;
        }
	}

}//end Class CoCreateDomain
module.exports = CoCreateDomain;




function getElementFromArray($array, keyFind){
	for(var key in $array){
		for(var j in $array[key]){
			if(keyFind == j)
				return $array[key];
		}
	}
	return [];
}

function getDomainsPrice($allPricing, $domains){
	let $domainsWithPrice = [];
	let $classKey = '';
	let num_domains = Object.keys($domains).length;
	if(num_domains  > 0) {
		for(var key in $domains){
			let domain = key;
			var row = {};
			row[domain] = {};
			row[domain]['status'] = ( $domains[domain].hasOwnProperty('status') && typeof $domains[domain]['status'] != 'undefined' ) ? $domains[domain]['status'] : '';
			if(row[domain]['status'] == 'available' ) {
				$classKey = $domains[domain]['classkey'];
				row[domain]['classKey'] = $classKey;
				let $prices = $allPricing[$classKey]['addnewdomain'];
				let $price = 0;
				for(var key_p in $prices){
					$price = $prices[key_p];
				}
				row[domain]['price'] = $price;
			}

			$domainsWithPrice.push(row);
		}
	}
	return $domainsWithPrice;
}

function validationForm(tlds,domainName){
    let tlds_list = [];
	if(typeof tlds != 'undefined' && tlds.length > 0)
		tlds_list = tlds

	if (domainName != ""){
		let $arr = domainName.split('.');
		let $checkStr = $arr[0];
		let $extension = 0;
		let $pos = 0;
		if ($checkStr == "www")
			domainName = $arr[1];
		if ($arr[0] != "www" && $arr.hasOwnProperty(1)){
			domainName = $arr[0];
			$extension = $arr[1];
			$pos = tlds_list.indexOf($extension);
			if ($pos !== -1){
				tlds_list.splice($pos,1);
			}
			tlds_list.unshift($extension);
		}
		if ($arr[0] == "www" && $arr.hasOwnProperty(2)){
			domainName = $arr[1];
			$extension = $arr[2];
			$pos = tlds_list.indexOf($extension);
			if ($pos !== -1){
				tlds_list.splice($pos,1);
			}
			tlds_list.unshift($extension);
		}
	}
	return tlds_list;
}//end validationForm
