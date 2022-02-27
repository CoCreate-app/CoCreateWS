const config = require('../CoCreate.config');
const CoCreateCrudServer = require('@cocreate/crud-server')
const CoCreateMessageServer = require('@cocreate/message-server')
const CoCreateMetricsServer = require('@cocreate/metrics-server')
const CoCreateAuth = require('@cocreate/auth')
const ServerPermission = require("./permission.js")


module.exports.init = async function(wsManager, dbClient) {
	try {
		let permission = new ServerPermission(dbClient)
		let auth = new CoCreateAuth(config.jwttoken)
		wsManager.setPermission(permission)
		wsManager.setAuth(auth)

		CoCreateCrudServer.init(wsManager, dbClient)
		CoCreateMessageServer.init(wsManager, dbClient);
		CoCreateMetricsServer.init(wsManager, dbClient)
		// return true;
	} catch (error) {
		console.error(error)
		return {
			status: false,
		}
	}
}