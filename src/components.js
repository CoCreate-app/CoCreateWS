const { config, database, jwttoken} = require('../CoCreate.config');
const crudServer = require('@cocreate/crud-server')
const fileServer = require('@cocreate/file-server')
const industry = require('@cocreate/industry')
const messageServer = require('@cocreate/message-server')
const metricsServer = require('@cocreate/metrics-server')
const organizations = require('@cocreate/organizations');
const serverSideRender = require('@cocreate/server-side-render');
const unique = require('@cocreate/unique');
const users = require('@cocreate/users');
const CoCreateAuth = require('@cocreate/auth')
const serverPermission = require("@cocreate/permissions");

module.exports.init = async function(app, wsManager) {
	try {
		process.env['organization_id'] = config.organization_id;
		process.env['database'] = database
		
		const databases = {
			mongodb: require('@cocreate/mongodb')
		}
		const crud = new crudServer(wsManager, databases, database)
		const render = new serverSideRender(crud);
		const file = new fileServer(crud, render)

		app.use('/', file.router)

		let auth = new CoCreateAuth(jwttoken)
		wsManager.setAuth(auth)
		let permission = new serverPermission(crud)
		wsManager.setPermission(permission)

		new industry(wsManager, crud);
		new messageServer(wsManager);
		new metricsServer(wsManager, crud);
		new organizations(wsManager, crud);
		new unique(wsManager, crud);
		new users(wsManager, crud);
		
	} catch (error) {
		console.error(error)
		return {
			status: false,
		}
	}
}