const { jwttoken } = require('../CoCreate.config');
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
const serverPermission = require("./permission.js");
const mongodb = require('@cocreate/mongodb');

module.exports.init = async function(app, wsManager) {
	try {
		const databases = {mongodb}
		const crud = new crudServer(wsManager, databases)
		const render = new serverSideRender(crud);
		const file = new fileServer(crud, render)

		app.use('/', file.router)

		let permission = new serverPermission(crud)
		let auth = new CoCreateAuth(jwttoken)
		wsManager.setPermission(permission)
		wsManager.setAuth(auth)

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