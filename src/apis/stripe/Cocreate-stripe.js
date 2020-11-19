/* global Y */
'use strict'
var utils= require('../utils');
const CoCreateBase = require("../../base");

class CoCreateStripe extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('stripe',		(socket, data) => this.sendStripe(socket, data));
		}
	}
	async sendStripe(socket, data) {
	    let that = this;
	    let send_response ='stripe';
	    let data_original = {...data};
	    console.log("Stripe ",data_original);
        let type = data['type'];
        delete data['type'];
        let url = '';
        let method = '';
        let targets = [];
        let tags = [];
        let key_stripe = 'sk_test_4eC39HqLyjWDarjtT1zdp7dc'
        console.log("type ",type)
        //const stripe = require('stripe')(key_stripe);    //// platform key
       // let charges =await stripe.charges.retrieve('ch_1HTyOl2eZvKYlo2CezyK5RPj');
        //const 
  
        const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
  
  
          
        /*Address*/
        
        switch (type) {
            case '.getBalanceBtn':
                // stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');                   //// use platform key
                stripe.balance.retrieve((err, balance) => {
                    if (!err && balance) {
                      utils.send_response(that.wsManager,socket,{"type":type,"response":balance},send_response)
                    } else if (err) {
                      utils.send_response(that.wsManager,socket,{"type":type,"response":0},send_response)
                    }
                  });
                break;
            case '.balanceTransactionBtn':
                const balanceTransaction = await stripe.balanceTransactions.retrieve(
                  'txn_1032HU2eZvKYlo2CEPtcnUvl'
                );
                console.log(" REspuesta ",balanceTransaction)
                utils.send_response(that.wsManager,socket,{"test":"from_server","response":balanceTransaction},send_response)
            break;
            case '.createCustomerBtn':
                const customer = await stripe.customers.create(data);
                //console.log(" REspuesta ",customer)
                utils.send_response(that.wsManager,socket,{"type":type,"response":customer},send_response)
            break;
            case '.createCardBtn':
                let id_customer = data['customer_id'];
                delete data['customer_id'];
                console.log("aaaa",data)
                const card = await stripe.customers.createSource(
                  id_customer,
                  data
                );
                utils.send_response(that.wsManager,socket,{"type":type,"response":card},send_response)
            break;
            case '.listCustomersBtn':
                const customers = await stripe.customers.list({limit: 3,});
                utils.send_response(that.wsManager,socket,{"type":type,"response":customers},send_response)
            break;
        }
        
        //utils.req(this.url_wilddock+url,method,data,this.wsManager,socket,'Stripe',data_original);
        
        //utils.send_response=(wsManager,socket,obj,send_response)
	    
	}// end sendStripe
	
}//end Class 
module.exports = CoCreateStripe;
