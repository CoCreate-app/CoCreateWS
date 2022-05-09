const { jwttoken } = require('../CoCreate.config');
const crudServer = require('@cocreate/crud-server')
const industry = require('@cocreate/industry')
const messageServer = require('@cocreate/message-server')
const metricsServer = require('@cocreate/metrics-server')
const organizations = require('@cocreate/organizations');
const unique = require('@cocreate/unique');
const users = require('@cocreate/users');
const CoCreateAuth = require('@cocreate/auth')
const ServerPermission = require("./permission.js")

module.exports.init = async function(wsManager, dbClient) {
	try {
		let permission = new ServerPermission(dbClient)
		let auth = new CoCreateAuth(jwttoken)
		wsManager.setPermission(permission)
		wsManager.setAuth(auth)

		crudServer.init(wsManager, dbClient);
		// new crudServer(wsManager, dbClient);
		new industry(wsManager, dbClient);
		new messageServer(wsManager, dbClient);
		new metricsServer(wsManager, dbClient);
		new organizations(wsManager, dbClient);
		new unique(wsManager, dbClient);
		new users(wsManager, dbClient);
	} catch (error) {
		console.error(error)
		return {
			status: false,
		}
	}
}