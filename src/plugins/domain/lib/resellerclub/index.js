const axios = require("axios");
const Qs = require("qs");
const resellerclub = {};

// https://manage.resellerclub.com/kb/answer/764

//axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;


resellerclub.connect = ({ clientID, clientSecret }) => {
    return new Promise((resolve, reject) => {
        if (!clientID) {
            reject("`clientID` is mandatory");
        }

        if (!clientSecret) {
            reject("ClientSecret is mandatory");
        } else {
          /**Producction
           '732854'
            '9jQBWrjYNhtIakQppbhkCkpExkvoiDkd'*/
          /**Testing
           clientID: 654546,
            clientSecret: "4WmYPtBgJzfbpKlHCH1ADS8QaXcLo2CS"
            */
            this.clientID = clientID;
            this.clientSecret = clientSecret;
            this.ENVIRONMENT = 'development';
            this.urlAPI = 'https://domaincheck.httpapi.com';
            resolve("RESELLER : Connection Established ["+this.clientID+"]");
        }
    });
};

this.request = ({ request, url, params, options }) => {
    
    return new Promise((resolve, reject) => {
        // Optionally the request above could also be done as
        if (!this.clientID) {
            reject("connection not establised");
        } else if (!this.clientSecret) {
            reject("connection not establised");
        } else {
            //console.log(this.urlAPI+'/api/'+url+'.json');
            
            params_function = {
                                    "auth-userid": this.clientID,
                                    "api-key": this.clientSecret
                                }
            Object.keys(params).forEach(key => params_function[key] = params[key]);
            /*Object.keys(params).forEach(key => {
              if(!Array.isArray(params[key]))
               params_function[key] = params[key]
            });*/

            //console.log(params_function);

            options = typeof options !== 'undefined' ? options : false;
            ext = typeof options['ext'] !== 'undefined' ? options['ext'] : 'json';
            url_api = typeof options['url_api'] !== 'undefined' ? options['url_api'] : this.urlAPI;
            
            url_completa = url_api + '/api/' + url + '.' + ext;
            console.log(url_completa)
            

            console.log('1=>*****************');
            console.log(params_function);
            console.log(Qs.stringify(params_function, { arrayFormat: "repeat" }))
            console.log(url_completa);
            console.log('1=>*****************');


            if(request=='get'){
                    axios
                        .get(url_completa, {
                            params: params_function,
                            paramsSerializer: function (params) {
                                return Qs.stringify(params, { arrayFormat: "repeat" });
                            }
                        })
                         .then(response => {
                             console.log("OK_get");
                            resolve(response.data);
                        })
                        .catch(error => {
                            console.log("ERROR_get")
                            reject(error.response);
                        });
                        
                    }
                    
            else{
                axios
                    .post(url_completa, Qs.stringify(params_function,{ arrayFormat: "repeat" }))
                    .then(response => {
                        console.log("OK_post");
                        resolve(response.data);
                    })
                    .catch(error => {
                      console.log("ERROR_post:")
                        reject(error.response.data);
                    });
            }//end else
        }
    });
};

/**
 * Domain
 */


/**
 * Checks the availability of the specified domain name(s).
 *
 * @see http://manage.resellerclub.com/kb/answer/764
 * @param domainName mixed Domain names, without tlds - array or string.
 * @param tlds mixed TLDs, array or string.
 * @param bool suggestAlternatives TRUE if domain name suggestions is needed.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.checkAvailability = ({ domainName, tlds, suggestAlternatives }) => {
    suggestAlternatives = typeof suggestAlternatives !== 'undefined' ? suggestAlternatives : false;
    return this.request({ request: 'get', url: 'domains/available', params: { 'domain-name': domainName, tlds: tlds, 'suggest-alternative': suggestAlternatives }});
};

/**
   * Checks the availability of Internationalized Domain Name(s) (IDN).
   *
   * @see http://manage.resellerclub.com/kb/answer/1427
   * @param domainName mixed Domain name in unicode as array or string.
   * @param tld mixed TLDs as array or string.
   * @param idnLanguageCode string IDN language code.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
resellerclub.checkAvailabilityIdn = ({ domainName, tld, idnLanguageCode }) => {
    punyDomain = [];
    if (Array.isArray(domainName)) {
        for (key in domainName) {
            punyDomain.push(domainName[key]);
        }
    }
    else {
        punyDomain.push(domainName);
    }
    params = { 'domain-name': punyDomain, tld: tld, 'idnLanguageCode': idnLanguageCode };
    return this.request({ request: 'get', url: 'domains/idn-available', params: params });
};


/**
 * Check availability of a premium domain name.
 *
 * @see http://manage.resellerclub.com/kb/answer/1948
 * @param keyWord string Keyword to search for.
 * @param tlds mixed Array or String of TLD(s).
 * @param options array See references.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.checkAvailabilityPremium = ({ keyWord, tlds, options }) => {
    options = typeof options !== 'undefined' ? options : {};
    options['key-word'] = keyWord;
    options['tlds'] = tlds;
    return this.request({ request: 'get', url: 'domains/premium/available', params: options });
};

/**
 * Returns domain name suggestions for a user-specified keyword.
 *
 * @see http://manage.resellerclub.com/kb/answer/1085
 * @param keyWord string Search keywords.
 * @param null tld Limit search to given TLDs.
 * @param bool exactMatch FALSE if we don't want exact match.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.domainSuggestions = ({ keyWord, tld, exactMatch, extra_options}) => {
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    tld = typeof tld !== 'undefined' ? tld : null;
    exactMatch = typeof exactMatch !== 'undefined' ? exactMatch : false;
    options = {};
    options['keyword'] = keyWord;
    options['tld-only'] = tld;
    options['exact-match'] = exactMatch;
    return this.request({ request: 'get', url: 'domains/v5/suggest-names', params: options, options: extra_options});
}


/**
 * Register a domain name.
 *
 * @see http://manage.resellerclub.com/kb/answer/752
 * @param domainName string Domain name.
 * @param options array Options, see reference.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.register = ({ domainName, options, extra_options}) => {
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    options['domain-name'] = domainName;
    return this.request({ request: 'post', url: 'domains/register', params: options, options: extra_options});
}


/**
 * Transfer a domain name.
 *
 * @see http://manage.resellerclub.com/kb/answer/758
 * @param domain string Domain name.
 * @param options array Options, see references.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.transfer = ({ domain, options, extra_options }) => {
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    options['domain-name'] = domain;
    return this.request({ request: 'post', url: 'domains/transfer', params: options, options: extra_options });
}


/**
 * Submit auth code for domain transfer.
 *
 * @see http://manage.resellerclub.com/kb/answer/2447
 * @param orderId integer Order Id.
 * @param authCode string Auth code from previous registrar.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.submitAuthCode = ({ orderId, authCode, extra_options }) => {
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    options ={
        'order-id' : orderId,
        'auth-code' : authCode,
    }
    return this.request({ request: 'post', url: 'domains/submit-auth-code', params: options, options: extra_options });
}


/**
 * Validate a transfer request.
 *
 * @see http://manage.resellerclub.com/kb/answer/1150
 * @param domain string Domain name.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */

resellerclub.validateTransfer = ({domain,extra_options}) => {
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    options = {
        'domain-name' : domain,
    }
    return this.request({ request: 'get', url: 'domains/validate-transfer', params: options , options: extra_options});
}

/**
 * Renew a domain.
 *
 * @see http://manage.resellerclub.com/kb/answer/746
 * @param orderid integer Order Id.
 * @param options array Options. See reference.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.renew = ({ orderid, options }) => {
    options['order-id'] = orderid;
    return this.request({ request: 'post', url: 'domains/renew', params: options });
}

/**
 * Search a domain.
 *
 * @see http://manage.resellerclub.com/kb/answer/771
 * @param options array Search options. See reference.
 * @param int page Page number.
 * @param int count Number of records to fetch.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.searchDomain = ({ options, page , count, extra_options }) => {
    page = page != '' ? page : 1;
    count = count != '' ? count : 10;
    options['no-of-records'] = count;
    options['page-no'] = page;
    return this.request({ request: 'get', url: 'domains/search', params: options, options:extra_options });
}


/**
 * Get the default nameserver for a domain.
 *
 * @see http://manage.resellerclub.com/kb/answer/788
 * @param customerId integer Customer ID.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getDefaultNameServer = ({ customerId }) => {
    options ={
        'customer-id' : customerId,
    }
    return this.request({ request: 'get', url: 'domains/customer-default-ns', params: options });
}


/**
 * Get order ID from domain name.
 *
 * @see http://manage.resellerclub.com/kb/answer/763
 * @param domain string Domain name.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getOrderId = ({ domain }) => {
    options = {
        'domain-name' : domain,
    }
    return this.request({ request: 'get', url: 'domains/orderid', params: options });
}

/**
 * Get details of domain by order ID.
 *
 * @see http://manage.resellerclub.com/kb/answer/770
 * @param orderId integer Order ID.
 * @param options string Options. See references.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getDomainDetailsByOrderId = ({ orderId, options }) => {
    // Since a parameter name is options, we are using variable as apiOptions
    apiOptions = {
        'order-id' : orderId,
    }
    if (typeof options === 'string') {
        apiOptions['options'] = options;
    }
    return this.request({ request: 'get', url: 'domains/details', params: apiOptions });
}

/**
 * Get details of domain by domain name.
 *
 * @see http://manage.resellerclub.com/kb/answer/1755
 * @param domain string Domain name.
 * @param options string See references for possible values.
 * @return array API options.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getDomainDetailsByDomain = ({ orderId, options }) => {
    // Since a parameter name is options, we are using variable as apiOptions
    apiOptions = {
        'domain-name' : domain,
    }
    if (typeof options === 'string') {
        apiOptions['options'] = options;
    }
    return this.request({ request: 'get', url: 'domains/details-by-name', params: apiOptions });
}

/**
 * Set nameserver for an order.
 *
 * @see http://manage.resellerclub.com/kb/answer/776
 * @param orderId integer Order Id.
 * @param ns array Nameservers to set.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.setNameServer = ({ orderId, ns }) => {
    options = {
        'order-id' : orderId,
        'ns' : ns,
    }
    return this.request({ request: 'post', url: 'domains/modify-ns', params: options });
}


/**
 * Set child name server for a domain.
 *
 * @see http://manage.resellerclub.com/kb/answer/780
 * @param orderId integer Order ID.
 * @param cns string Child Nameserver.
 * @param ips array IP addresses.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.setChildNameServer = ({ orderId, cns, ips }) => {
    options = {
        'order-id' : orderId,
        'cns' : cns,
        'ip' : ips,
    }
    return this.request({ request: 'post', url: 'domains/add-cns', params: options });
}

/**
 * Modify Child nameserver host of a domain.
 *
 * @see http://manage.resellerclub.com/kb/answer/781
 * @param orderId integer Order ID.
 * @param oldCns string Old child nameserver.
 * @param newCns string New child nameserver.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.modifyChildNameServerHost = ({ orderId, oldCns, newCns }) => {
    options = {
        'order-id' : orderId,
        'old-cns' : oldCns,
        'new-cns' : newCns,
    }
    return this.request({ request: 'post', url: 'domains/modify-cns-name', params: options });
}

  /**
   * Modify a child name server's IP address.
   *
   * @see http://manage.resellerclub.com/kb/answer/782
   * @param orderId integer Order ID.
   * @param cns string Child name server to modify.
   * @param oldIp string Old IP address.
   * @param newIp string New IP address.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
resellerclub.modifyChildNameServerHost = ({ orderId, cns, oldIp, newIp }) => {
    options = {
      'order-id' : orderId,
      'cns' : cns,
      'old-ip' : oldIp,
      'new-ip' : newIp,
    }
    return this.request({ request: 'post', url: 'domains/modify-cns-ip', params: options });
  }

  /**
   * Delete a child name server.
   *
   * @see http://manage.resellerclub.com/kb/answer/934
   * @param orderId integer Order ID.
   * @param cns string Child Nameserver.
   * @param ip string IP address.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
resellerclub.deleteChildNameServer = ({ orderId, cns, ip }) => {
    options = {
      'order-id' : orderId,
      'cns' : cns,
      'ip' : ip,
    }
    return this.request({ request: 'post', url: 'domains/delete-cns-ip', params: options });
  }

  /**
   * Modify contacts of a domain name.
   *
   * @see http://manage.resellerclub.com/kb/answer/777
   * @param orderId int Order ID
   * @param contactIds array Contact IDs in array, all are mandatory see reference.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
resellerclub.modifyDomainContacts = ({ orderId, contactIds }) => {
    options = contactIds;
    options['order-id'] = orderId
    return this.request({ request: 'post', url: 'domains/modify-contact', params: options });
  }

  /**
   * Add privacy protection for a domain.
   *
   * @see http://manage.resellerclub.com/kb/answer/2085
   * @param orderId integer Order ID.
   * @param invoiceOption string See references for allowed options.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
resellerclub.addPrivacyProtection = ({ orderId, invoiceOption }) => {
    options = {
      'order-id' : orderId,
      'invoice-option' : invoiceOption,
    }
    return this.request({ request: 'post', url: 'domains/purchase-privacy', params: options });
  }

  /**
   * Modify privacy protection for an order.
   *
   * @see http://manage.resellerclub.com/kb/answer/778
   * @param orderId integer Order ID.
   * @param protectPrivacy boolean TRUE to enable privacy, else FALSE.
   * @param reason string Reason for change.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
   resellerclub.modifyPrivacyProtection = ({ orderId, protectPrivacy, reason }) => {
     options = {
      'order-id' : orderId,
      'protect-privacy' : protectPrivacy,
      'reason' : reason,
    }
    return this.request({ request: 'post', url: 'domains/modify-privacy-protection', params: options });
  }

  /**
   * Modify domain transfer Auth code.
   *
   * @see http://manage.resellerclub.com/kb/answer/779
   * @param orderId integer Order ID.
   * @param authCode string Auth Code for domain transfer.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
   resellerclub.modifyAuthCode = ({ orderId, authCode }) => {
    options = {
      'order-id'  : orderId,
      'auth-code'  : authCode,
    }
    return this.request({ request: 'post', url: 'domains/modify-auth-code', params: options });
  }

  /**
   * Modify theft protection status.
   *
   * @see http://manage.resellerclub.com/kb/answer/902
   * @see http://manage.resellerclub.com/kb/answer/903
   * @param orderId integer Order ID.
   * @param status boolean TRUE to enable theft protection, else FALSE.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
   resellerclub.modifyTheftProtection = ({ orderId, status }) => {
    // Involves 2 API calls
    options = {
      'order-id' : orderId,
    }
    apiCall = status ? 'enable-theft-protection': 'disable-theft-protection';
    url = 'domains/'+apiCall;
    return this.request({ request: 'post', url: url, params: options });
  }

  /**
   * Suspend a domain.
   *
   * @see http://manage.resellerclub.com/kb/answer/1451
   * @param orderId integer Order ID.
   * @param reason string Reason for transfer.
   * @return array API options.
   * @throws \Resellerclub\ApiConnectionException
   */
resellerclub.suspendDomain = ({ orderId, reason }) => {
    options = {
      'order-id' : orderId,
      'reason' : reason,
    }
    return this.request({ request: 'post', url: 'domains/suspend', params: options });
  }

  /**
   * Unsuspend a domain.
   *
   * @see http://manage.resellerclub.com/kb/answer/1452
   * @param orderId integer Order ID to suspend.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
resellerclub.unsuspendDomain = ({ orderId }) => {
    options = {
      'order-id' :orderId,
    }
    return this.request({ request: 'post', url: 'domains/unsuspend', params: options });
  }

  /**
   * Delete a domain.
   *
   * @see http://manage.resellerclub.com/kb/answer/745
   * @param orderId integer OrderID for domain to delete.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
   resellerclub.deleteDomain = ({ orderId }) => {
      options = {
          'order-id' :orderId,
        }
    return this.request({ request: 'post', url: 'domains/delete', params: options });
  }

  /**
   * Restore a domain.
   *
   * @see http://manage.resellerclub.com/kb/answer/760
   * @param orderId integer Order ID.
   * @param invoiceOption string See reference for allowed options.
   * @return array API output.
   * @throws \Resellerclub\ApiConnectionException
   */
resellerclub.restoreDomain = ({ orderId, invoiceOption }) => {
    options = {
      'order-id' : orderId,
      'invoice-option' : invoiceOption
    }
    return this.request({ request: 'post', url: 'domains/restore', params: options });
  }
/** Products */

/**
 * Getting the Customer Pricing.
 * 
 * @see http://manage.resellerclub.com/kb/answer/864
 * @param customerId integer Customer Id.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getPrincingCustomer = ({ customerId }) => {
    customerDetails['customer-id'] = customerId;
    return this.request({ request: 'post', url: 'products/customer-price', params: customerDetails });
}

/**
 * Get ProductCategory-ProductKeys Mapping.
 * 
 * @see http://manage.resellerclub.com/kb/answer/862
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getProductsKeysMapping = () => {
    options = {};
    return this.request({ request: 'post', url: 'products/category-keys-mapping', params: options });
}

/** Contacts  */


/**
 * Creates a contact with given contact details.
 *
 * @see http://manage.resellerclub.com/kb/answer/790
 * @param contactDetails array Details Contact details array as specified in API docs.
 * @return array Output of the API call.
 * @throws \Resellerclub\ApiConnectionException
 */

resellerclub.createContact = ({ contactDetails, extra_options }) => {
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    return this.request({ request: 'post', url: 'contacts/add', params: contactDetails, options: extra_options});
}

/**
 * Deletes a contact from its ID.
 *
 * @see http://manage.resellerclub.com/kb/answer/796
 * @param contactId integer ID of contact to delete
 * @return array Output of API call
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.deleteContact = ({ contactId, extra_options }) => {
    let contactDetails = {};
    contactDetails = {'contact-id' : contactId};
    return this.request({ request: 'post', url: 'contacts/delete', params: contactDetails, options: extra_options});
}

/**
 * Modify the details of a contact
 *
 * @see http://manage.resellerclub.com/kb/answer/791
 * @param contactId array ID of contact to modify.
 * @param contactDetails array Details of contact according to API docs.
 * @return array Output of API call
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.editContact = ({ contactId, contactDetails, extra_options }) => {
    contactDetails['contact-id'] = contactId;
    return this.request({ request: 'post', url: 'contacts/edit', params: contactDetails, options: extra_options});
}

/**
 * Get the contact details by ID.
 *
 * @see http://manage.resellerclub.com/kb/answer/792
 * @param contactId integer ID of contact to fetch.
 * @return array Output of API call.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getContact = ({ contactId }) => {
    contactDetails['contact-id'] = contactId;
    return this.request({ request: 'get', url: 'contacts/details', params: contactDetails });
}

/**
 * Search for a contact by specified customer.
 *
 * @see http://manage.resellerclub.com/kb/answer/793
 * @param customerId integer The Customer for which you want to get the Contact Details.
 * @param contactDetails array Parameters needed to search.
 * @param int count Number of records to be shown per page.
 * @param int page Page number.
 * @return array Output of API call.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.searchContact = ({ contactId, contactDetails, count, page }) => {
    page = typeof page !== 'undefined' ? page : 1;
    count = typeof count !== 'undefined' ? count : 10;
    contactDetails['customer-id'] = customerId;
    contactDetails['no-of-records'] = count;
    contactDetails['page-no'] = page;
    return this.request({ request: 'get', url: 'contacts/search', params: contactDetails });
}

/***DNS */

/*Activate dns free*/
resellerclub.editContact = ({ order }) => {
    options =  {
        "order-id" : order
    }
    return this.request({ request: 'post', url: 'dns/activate', params: options });
}
/*Add dns record in a domain*/
resellerclub.addNsRecord = ({ domainName, options }) => {
    options['domain-name'] = domainName;
    return this.request({ request: 'post', url: 'dns/manage/add-ns-record', params: options });
}
/* Add record A in domain */
resellerclub.addARecord = ({ domainName, options }) => {
    options['domain-name'] = domainName;
    return this.request({ request: 'post', url: 'dns/manage/add-ipv4-record', params: options });
}
/* add or UPDATE  RECORD  DNS recerod in domain
txt -> https://manage.resellerclub.com/kb/node/1097 
mx -> https://manage.resellerclub.com/kb/node/1102 
cname -> https://manage.resellerclub.com/kb/node/1175
*/

resellerclub.dnsRecord = ({ opt, options, extra_options }) => {
    let urlAction = options['type'];
    delete options['type'];
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    let keys_obj = Object.keys(options);
    let url = '';
    if( urlAction.indexOf('Delete') !=-1  ? false : true )
        url = ( keys_obj.indexOf('current-value') != -1 && keys_obj.indexOf('new-value') != -1 ) ? 'dns/manage/update-'+opt+'-record' : 'dns/manage/add-'+opt+'-record';
    else
        url = 'dns/manage/delete-'+opt+'-record'
    return this.request({ request: 'post', url: url, params: options, options: extra_options});
}

/* update record txt in domain
https://manage.resellerclub.com/kb/node/1097 */
resellerclub.updateTxtRecord = ({ domainName, options, extra_options }) => {
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    options['domain-name'] = domainName;
    return this.request({ request: 'post', url: 'dns/manage/update-txt-record', params: options, options: extra_options});
}

/*Add record mx in domain*/
resellerclub.addMxRecord = ({ domainName, options }) => {
    options['domain-name'] = domainName;
    return this.request({ request: 'post', url: 'dns/manage/add-mx-record', params: options });
}
/*Add CName recrods in domain*/
resellerclub.addCnameRecord = ({ domainName, options }) => {
    options['domain-name'] = domainName;
    return this.request({ request: 'post', url: 'dns/manage/add-cname-record', params: options });
}

//Add all required records for CoCreate
resellerclub.addAllRecords = ({ domain }) => {
    //Add Name Server Records
    if ('development' === this.ENVIRONMENT) {
        nsRecords = ['ns1.onlyfordemo.net', 'ns2.onlyfordemo.net'];
    } else {
        nsRecords = ['hand676937.mars.orderbox-dns.com', 'hand676937.earth.orderbox-dns.com', 'hand676937.venus.orderbox-dns.com', 'hand676937.mercury.orderbox-dns.com'];
    }
    for (key in nsRecords) {
        record = nsRecords[key];
        details = {
            "domain-name" : domain,
            "value" : record,
            "host" : domain,
        }
        nsRecord[record] = this.addNsRecord(domain, details);
    }

    //Add txt record
    details = {
        'value' : 'v=spf1 a mx ptr ip4:208.109.80.0/24 include:_spf.google.com -all',
        'host' : '@'
    }
    resultSpf = this.addTxtRecord(domain, details);

    //Creates DKIM 1
    details = {
        'value' : 'o=~; r=noreply@'+domain,
        'host' : '_domainKey'
    }
    resultDKIM1 = this.addTxtRecord(domain, details);

    //creates DKIM 2
    /*
    details = array(
      'value' => 'k=rsa; p='.,
      'host' => 'mainkey._domainkey'
    );
    resultDKIM2 = dns->addTxtRecord(domain, details);
    */

    /*Add A Records*/
    records_a = ['@', '*', 'mail'];
    for (key in records_a) {
        record = records_a[key];
        details = {
            'value' : '132.148.1.250',
            'host' : record
        }
        result = this.addARecord(domain, details);
        resultA[record] = result;
    }

    //Add mx records
    records_mx = ['mail.'+domain+'.com', 'imap.'+domain+'.com', 'aspmx.l.google.com', 'alt1.aspmx.l.google.com', 'alt2.aspmx.l.google.com', 'alt3.aspmx.l.google.com', 'alt4.aspmx.l.google.com'];
    for (key in records_mx) {
        record = records_mx[key];
        details = {
            'value' : record,
            'host' : domain
        }
        resultMx = this.addMxRecord(domain, details);
        resultsMx[record] = resultMx;
    }

    //Add cname
    details = {
        'value' : 'mailgun.org',
        'host' : 'email.'+domain
    }
    resultCname = this.addCnameRecord(domain, details);
    return {"nsRecord": nsRecord, "resultSpf": resultSpf, "resultDKIM1": resultDKIM1, "resultA": resultA, "resultsMx": resultsMx, "resultCname": resultCname};
}

/** Customer */


/**
 * Creates a Customer Account using the details provided.
 *
 * @see http://manage.resellerclub.com/kb/answer/804
 * @param customerDetails array See reference.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.createCustomer = ({ customerDetails, extra_options }) => {
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    return this.request({ request: 'post', url: 'customers/signup', params: customerDetails , options: extra_options });
}


/**
 * Modifies the Account details of the specified Customer.
 *
 * @see http://manage.resellerclub.com/kb/answer/805
 * @param customerId integer Customer Id.
 * @param customerDetails array See reference.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.editCustomer = ({ customerId, customerDetails, extra_options }) => {
    customerDetails['customer-id'] = customerId;
    return this.request({ request: 'post', url: 'customers/modify', params: customerDetails, options: extra_options });
}

/**
 * Gets the Customer details for the specified Customer Username.
 *
 * @see http://manage.resellerclub.com/kb/answer/874
 * @param userName string User name (email).
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getCustomerByUserName = ({ userName }) => {
    customerDetails['username'] = userName;
    return this.request({ request: 'get', url: 'customers/details', params: customerDetails });
}

/**
 * Gets the Customer details for the specified Customer Id.
 *
 * @param customerId integer Customer Id.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getCustomerByCustomerId = ({ customerId, extra_options }) => {
    let customerDetails = [];
    customerDetails['customer-id'] = customerId;
    return this.request({ request: 'get', url: 'customers/details-by-id', params: customerDetails, options: extra_options });
}

/**
 * Authenticates a Customer by returning an authentication token.
 *
 * @see http://manage.resellerclub.com/kb/answer/818
 * @param userName string User Name.
 * @param password string Password.
 * @param ip string IP address.
 * @return array API output. Token if successfully authenticated.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.generateToken = ({ userName, password, ip }) => {
    customerDetails['username'] = userName;
    customerDetails['passwd'] = password;
    customerDetails['ip'] = ip;
    return this.request({ request: 'get', url: 'customers/generate-token', params: customerDetails });
}

/**
 * Authenticates the token generated by the Generate Token method.
 * @param token string Authentication token.
 * @return array API output. Customer details if authenticated.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.authenticateToken = ({ token }) => {
    customerDetails['token'] = token;
    return this.request({ request: 'post', url: 'customers/authenticate-token', params: customerDetails });
}

/**
 * Changes the password for the specified Customer.
 *
 * @see http://manage.resellerclub.com/kb/answer/806
 * @param customerId integer Customer ID.
 * @param newPassword string New password.
 * @return array API output. TRUE is password change is successful.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.changePassword = ({ customerId, newPassword }) => {
    customerDetails['customer-id'] = customerId;
    customerDetails['new-passwd'] = newPassword;
    return this.request({ request: 'post', url: 'customers/change-password', params: customerDetails });
}

/**
 * Generates a temporary password for the specified Customer.
 *
 * @see http://manage.resellerclub.com/kb/answer/1648
 * @param customerId integer Customer ID.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.generateTemporaryPassword = ({ customerId }) => {
    customerDetails['customer-id'] = customerId;
    return this.request({ request: 'post', url: 'customers/temp-password', params: customerDetails });
}

/**
 * Gets details of the Customers that match the Search criteria.
 *
 * @see http://manage.resellerclub.com/kb/answer/1270
 * @param customerDetails array Details of customer. See reference.
 * @param int page Page number.
 * @param int count Number of records to fetch.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.searchCustomer = ({ customerDetails, count , page  }) => {
    page = typeof page !== 'undefined' ? page : 1;
    count = typeof count !== 'undefined' ? count : 10;
    customerDetails['no-of-records'] = count;
    customerDetails['page-no'] = page;
    return this.request({ request: 'get', url: 'customers/search', params: customerDetails });
}

/**
 * Generates a forgot password email and sends it to the customer's email address.
 *
 * @see http://manage.resellerclub.com/kb/answer/2410
 * @param userName string Username.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.forgotPassword = ({ userName }) => {
    customerDetails['forgot-password'] = userName;
    return this.request({ request: 'post', url: 'customers/forgot-password', params: customerDetails });
}

/**
 * Deletes the specified Customer, if the Customer does not have any Active Order(s).
 * 
 * @see http://manage.resellerclub.com/kb/answer/886
 * @param customerId integer Customer Id.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.deleteCustomer = ({ customerId , extra_options}) => {
    let customerDetails = [];
    customerDetails['customer-id'] = customerId;
    return this.request({ request: 'post', url: 'customers/delete', params: customerDetails, options:extra_options });
}

/** Billing  */
/**
 * Get the pricing of customer.
 *
 * @see http://manage.resellerclub.com/kb/answer/864
 * @param customerId integer Customer ID
 * @return array API call output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getCustomerPricing = ({ customerId }) => {
    options = {
        'customer-id' : customerId,
    }
    return this.request({ request: 'get', url: 'products/customer-price', params: options });
}

/**
 * Get pricing for reseller.
 *
 * @see http://manage.resellerclub.com/kb/answer/865
 * @param resellerId integer Reseller ID.
 * @return array API call output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getResellerPricing = ({ resellerId }) => {
    options = {
        'reseller-id' : resellerId,
    }
    return this.request({ request: 'get', url: 'products/reseller-price', params: options });
}

/**
 * Get the cost pricing of reseller.
 *
 * @see http://manage.resellerclub.com/kb/answer/1029
 * @param resellerId integer Reseller ID
 * @return array API call output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getResellerCostPricing = ({extra_options}) => {
    extra_options = typeof extra_options !== 'undefined' ? extra_options : false;
    options = {}
    return this.request({ request: 'get', url: 'products/reseller-cost-price', params: options , options: extra_options});
}

/**
 * Gets a Customer's Transactions along with their details.
 *
 * @see http://manage.resellerclub.com/kb/answer/868
 * @param transactionIds mixed Array or a single Transaction ID.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getCustomerTransactionDetails = ({ transactionIds }) => {
    options = {
        'transaction-ids' : transactionIds,
    }
    return this.request({ request: 'get', url: 'products/customer-transactions', params: options });
}

/**
 * Gets a Reseller's Transactions along with their details.
 *
 * @see http://manage.resellerclub.com/kb/answer/1155
 * @param transactionIds mixed Array or a single Transaction ID.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getResellerTransactionDetails = ({ transactionIds }) => {
    options =  {
        'transaction-ids' : transactionIds,
    }
    return this.request({ request: 'get', url: 'products/reseller-transactions', params: options });
}

/**
 * Pay the transactions using the account balance.
 *
 * @see http://manage.resellerclub.com/kb/answer/871
 * @param invoiceIds array IDs of invoices.
 * @param debitIds array Ids of debit Ids
 * @return array API call output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.payTransactions = ({ invoiceIds, debitIds }) => {
    invoiceIds = typeof invoiceIds !== 'undefined' ? invoiceIds : [];
    debitIds = typeof debitIds !== 'undefined' ? debitIds : [];
    options = {
        'invoice-ids' : invoiceIds,
        'debit-ids' : debitIds,
    }
    return this.request({ request: 'post', url: 'billing/customer-pay', params: options });
}

/**
 * Cancel invoice(s) or/and debit note(s).
 *
 * @see http://manage.resellerclub.com/kb/answer/2415
 * @param invoiceIds array Invoice ids.
 * @param debitIds array Debit note ids.
 * @return array API Output.
 * @throws \Resellerclub\ApiConnectionException
 */
/** ojo */
resellerclub.cancelInvoiceDebitNote = ({ invoiceIds, debitIds }) => {
    invoiceIds = typeof invoiceIds !== 'undefined' ? invoiceIds : [];
    debitIds = typeof debitIds !== 'undefined' ? debitIds : [];
    options = {
        'invoice-ids' : invoiceIds,
        'debit-ids' : debitIds,
    }
    return this.request({ request: 'post', url: 'billing/cancel/customer-transactions', params: options });
}

/**
 * Get account balance of a customer.
 *
 * @see http://manage.resellerclub.com/kb/answer/872
 * @param customerId int Customer ID.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getCustomerBalance = ({ customerId }) => {
    options = {
        'customer-id' :customerId,
    }
    return this.request({ request: 'get', url: 'billing/customer-balance', params: options });
}

/**
 * Execute an order without payment from customer side.
 *
 * @see http://manage.resellerclub.com/kb/answer/873
 * @param invoiceIds array Invoice ID(s).
 * @param bool cancelInvoice TRUE if invoice needs to be cancelled, else FALSE.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.executeOrderWithoutPayment = ({ invoiceIds, cancelInvoice }) => {
    cancelInvoice = typeof cancelInvoice !== 'undefined' ? cancelInvoice : false;
    options = {
        'invoice-ids' : invoiceIds,
        'cancel-invoice' : cancelInvoice,
    }
    return this.request({ request: 'post', url: 'billing/execute-order-without-payment', params: options });
}

/**
 * Gets a detailed list of Customer's Transactions, matching the search criteria.
 *
 * @see http://manage.resellerclub.com/kb/answer/964
 * @param options array Search criteria. See reference for options.
 * @param int page Page number.
 * @param int count Number of records to fetch.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
/** ojo */
resellerclub.searchCustomerTransaction = ({ options, page, count  }) => {
    page = typeof page !== 'undefined' ? page : 1;
    count = typeof count !== 'undefined' ? count : 10;
    options['no-of-records'] = count;
    options['page-no'] = page;
    //TODO: Check
    return this.request({ request: 'get', url: 'billing/search/customer-transactions', params: options });
}

/**
 * Gets a detailed list of Reseller's Transactions, matching the search criteria.
 *
 * @see http://manage.resellerclub.com/kb/answer/1153
 * @param options array Search criteria. See reference for options.
 * @param int page Page number.
 * @param int count Number of records to fetch.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
/** ojo */
resellerclub.searchResellerTransaction = ({ options, page, count }) => {
    page = typeof page !== 'undefined' ? page : 1;
    count = typeof count !== 'undefined' ? count : 10;
    options['no-of-records'] = count;
    options['page-no'] = page;
    return this.request({ request: 'get', url: 'billing/search/reseller-transactions', params: options });
}

/**
 * Get available account balance of a reseller.
 *
 * @see http://manage.resellerclub.com/kb/answer/1110
 * @param resellerId int Reseller ID.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getResellerBalance = ({ resellerId }) => {
    options = {
        'reseller-id' : resellerId,
    }
    return this.request({ request: 'get', url: 'billing/reseller-balance', params: options });
}

/**
 * Adds a discount for a given invoice.
 *
 * @see http://manage.resellerclub.com/kb/answer/2414
 * @param invoiceId int Invoice ID to be discounted.
 * @param discount float Discount amount without tax.
 * @param transactionKey string A unique transaction key.
 * @param role string "reseller"/"customer"
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.discountInvoice = ({ invoiceId, discount, transactionKey, role }) => {
    options = {
        'invoice-id' : invoiceId,
        'discount-without-tax': discount,
        'transaction-key' : transactionKey,
        'role' : role,
    }
    return this.request({ request: 'post', url: 'billing/customer-processdiscount', params: options });
}

/**
 * Adds funds in a Customer's Account.
 *
 * @see http://manage.resellerclub.com/kb/answer/1152
 * @param customerId integer Customer id.
 * @param options array Details like amount, see reference.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.addFundsCustomer = ({ customerId, options }) => {
    options['customer-id'] = customerId;
    return this.request({ request: 'post', url: 'billing/add-customer-fund', params: options });
}

/**
 * Adds funds in a Reseller's Account.
 *
 * @see http://manage.resellerclub.com/kb/answer/1151
 * @param resellerId integer Reseller id.
 * @param options array Details like amount, see reference.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.addFundsReseller = ({ resellerId, options }) => {
    options['reseller-id'] = resellerId;
    return this.request({ request: 'post', url: 'billing/add-reseller-fund', params: options });
}

/**
 * Add debit note in a Customer's Account.
 *
 * @see http://manage.resellerclub.com/kb/answer/1166
 * @param customerId integer Customer id.
 * @param options array Details like amount, see reference.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.addDebitNoteCustomer = ({ customerId, options }) => {
    options['customer-id'] = customerId;
    return this.request({ request: 'post', url: 'billing/add-customer-debit-note', params: options });
}

/**
 * Add debit note in a Reseller's Account.
 *
 * @see http://manage.resellerclub.com/kb/answer/1167
 * @param resellerId integer Reseller id.
 * @param options array Details like amount, see reference.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.addDebitNoteReseller = ({ resellerId, options }) => {
    options['reseller-id'] = resellerId;
    return this.request({ request: 'post', url: 'billing/add-reseller-debit-note', params: options });
}

/**
 * Suspend an order, in case the client screws up.
 *
 * @see http://manage.resellerclub.com/kb/answer/1077
 * @param orderId integer Order Id to suspend.
 * @param reason string Reason to state for suspension.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.suspendOrder = ({ orderId, reason }) => {
    options = {
        'order-id' : orderId,
        'reason' :  reason,
    }
    return this.request({ request: 'post', url: 'orders/suspend', params: options });
}

/**
 * Unsuspend an order.
 *
 * @see http://manage.resellerclub.com/kb/answer/1078
 * @param orderId integer Order ID to unsuspend.
 * @return array API Output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.unsuspendOrder = ({ orderId }) => {
    options = {
        'order-id' : orderId,
    }
    return this.request({ request: 'post', url: 'orders/unsuspend', params: options });
}

/**
 * Gets the Current Actions based on the criteria specified.
 *
 * @see http://manage.resellerclub.com/kb/answer/908
 * @param options array Search parameters. See reference.
 * @param int page Page number.
 * @param int count Number of records to fetch.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getCurrentActions = ({ options, page ,count }) => {
    page = typeof page !== 'undefined' ? page : 1;
    count = typeof count !== 'undefined' ? count : 10;
    options['no-of-records'] = count;
    options['page-no'] = page;
    return this.request({ request: 'get', url: 'actions/search-current', params: options });
}

/**
 * Searches the Archived Actions based on the criteria specified.
 *
 * @see http://manage.resellerclub.com/kb/answer/909
 * @param options array Search parameters. See reference.
 * @param int page Page number.
 * @param int count Number of records to fetch.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getArchiveActions = ({ options, page, count }) => {
    page = typeof page !== 'undefined' ? page : 1;
    count = typeof count !== 'undefined' ? count : 10;
    options['no-of-records'] = count;
    options['page-no'] = page;
    return this.request({ request: 'get', url: 'actions/search-archived', params: options });
}

/**
 * Gets the default and customized Legal Agreements.
 *
 * @see http://manage.resellerclub.com/kb/answer/835
 * @param type string type of legal aggrement. See reference.
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getLegalAggrement = ({ type }) => {
    options = {
        'type' : type
    }
    return this.request({ request: 'get', url: 'commons/legal-agreements', params: options });
}

/**
 * Get allowed payment gateway for a customer
 *
 * @param int customerId Customer ID
 * @param string paymentType Values can be AddFund or Payment.
 * @return array Parsed output of API call
 */
resellerclub.getAllowedPaymentGatewayCustomer = ({ customerId, paymentType }) => {
    paymentType = typeof paymentType !== 'undefined' ? paymentType : null;
    options['customer-id'] = customerId;
    if (paymentType != null) {
        options['payment-type'] = paymentType;
    }
    return this.request({ request: 'get', url: 'pg/allowedlist-for-customer', params: options });
}

/**
 * Get allowed Payment Gateways
 * @return array Parsed output of API call
 */
resellerclub.getAllowedPaymentGatewayReseller = () => {
    options = {}
    return this.request({ request: 'get', url: 'pg/list-for-reseller', params: options });
}

/**
 * Get a list of approved currencies.
 *
 * @see http://manage.resellerclub.com/kb/answer/1745
 * @return array API output.
 * @throws \Resellerclub\ApiConnectionException
 */
resellerclub.getCurrencyDetails = () => {
    options = {}
    return this.request({ request: 'get', url: 'currency/details', params: options });
}

/**
 * Get list of country
 *
 * @see http://manage.resellerclub.com/kb/answer/1746
 * @return array Parsed output of API call
 */
resellerclub.getCountryList = () => {
    options = {}
    return this.request({ request: 'get', url: 'currency/list', params: options });
}

/**
 * Get list of states of a given country
 *
 * @see http://manage.resellerclub.com/kb/answer/1747
 * @param string countryCode 2 letter country code
 * @return array Parsed output of API call
 */
resellerclub.getStateList = ({ countryCode }) => {
    options = {
        'country-code': countryCode,
    }
    return this.request({ request: 'post', url: 'country/state-list', params: options });
}


module.exports = resellerclub;