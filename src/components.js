const { config, database, jwttoken } = require('../CoCreate.config');
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

module.exports.init = async function (app, wsManager) {
    try {
        process.env['organization_id'] = config.organization_id;
        process.env['key'] = config.key;
        process.env['database'] = database

        const databases = {
            mongodb: require('@cocreate/mongodb')
        }
        const crud = new crudServer(wsManager, databases, database)
        const render = new serverSideRender(crud);
        const file = new fileServer(crud, render)
        app.use('/', file.router)
        app.disable('x-powered-by');

        let auth = new CoCreateAuth(jwttoken)
        wsManager.setAuth(auth)
        let permission = new serverPermission(crud)
        wsManager.setPermission(permission)

        new messageServer(wsManager);
        new industry(crud);
        new metricsServer(crud);
        new unique(crud);
        new organizations(crud);
        new users(crud);

    } catch (error) {
        console.error(error)
        return {
            status: false,
        }
    }
}