
const MongoClient = require('mongodb').MongoClient;
const config = require('../config.json');

const CoCreateCrudServer = require('@cocreate/crud-server')
const CoCreateMessageServer = require('@cocreate/message-server')
const CoCreateMetricsServer = require('@cocreate/metrics-server')
const CoCreatePermission = require("@cocreate/permissions")

module.exports.init = async function(manager) {
	try {
		let db_client = await MongoClient.connect(config.db_url, { useNewUrlParser: true, poolSize: 10 });
		CoCreateCrudServer.init(manager, db_client)
		CoCreateMessageServer.init(manager, db_client);
		CoCreateMetricsServer.init(manager, db_client)
		let permission = new CoCreatePermission(db_client)
		return {
			status: true, 
			instances: {
				crudserver: CoCreateCrudServer,
				messageserver: CoCreateMessageServer,
				metricsserver: CoCreateMessageServer,
				permission: permission
			}
		}
		// return true;
	} catch (error) {
		console.error(error)
		return {
			status: false,
		}
	}
}

// let orgid = data.data.organization_id


// //. we can't define  static organization and apikey when create instance 
// var permission = new CheckPermssion({
// 	organization_id: orgid, // i get confused by this string becassu im use to this...
// 					//. this is collect, 
// 	apikey: "data.data.apikey",
// 	CheckIfTrue: {
//         //. please add your susggestion
        
//     }
// })