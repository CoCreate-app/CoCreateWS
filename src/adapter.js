
const MongoClient = require('mongodb').MongoClient;
const config = require('../config');

const CoCreateCrudServer = require('@cocreate/crud-server')
const CoCreateMessageServer = require('@cocreate/message-server')
const CoCreateMetricsServer = require('@cocreate/metrics-server')
const CoCreateAuth = require('@cocreate/auth')
const ServerPermission = require("./permission.js")


module.exports.init = async function(manager) {
	try {
		let db_client = await MongoClient.connect(config.db_url, { useNewUrlParser: true, poolSize: 10 });
		let permission = new ServerPermission(db_client)
		let auth = new CoCreateAuth(config.jwttoken)
		manager.setPermission(permission)
		manager.setAuth(auth)

		CoCreateCrudServer.init(manager, db_client)
		CoCreateMessageServer.init(manager, db_client);
		CoCreateMetricsServer.init(manager, db_client)
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
