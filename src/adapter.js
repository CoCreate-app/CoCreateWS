
const MongoClient = require('mongodb').MongoClient;
const config = require('../config.json');

const CoCreateCrudServer = require('@cocreate/crud-server')
const CoCreateMessageServer = require('@cocreate/message-server')
const CoCreateMetricsServer = require('@cocreate/metrics-server')

module.exports.init = async function(manager) {
	try {
		let db_client = await MongoClient.connect(config.db_url, { useNewUrlParser: true, poolSize: 10 });
		CoCreateCrudServer.init(manager, db_client)
		CoCreateMessageServer.init(manager, db_client);
		CoCreateMetricsServer.init(manager, db_client)
		return true;
	} catch (error) {
		console.error(error)
	}
}
