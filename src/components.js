const { config, database, db, jwttoken } = require('../CoCreate.config');
const crudServer = require('@cocreate/crud-server')
const fileServer = require('@cocreate/file-server')
const industry = require('@cocreate/industry')
const messageServer = require('@cocreate/message-server')
const metricsServer = require('@cocreate/metrics-server')
const organizations = require('@cocreate/organizations');
const serverSideRender = require('@cocreate/server-side-render');
const unique = require('@cocreate/unique');
const users = require('@cocreate/users');
const authenticate = require('@cocreate/auth')
const authorize = require("@cocreate/permissions");

module.exports.init = async function (app, wsManager) {
    try {
        process.env['organization_id'] = config.organization_id;
        process.env['key'] = config.key;
        process.env['db'] = db

        const databases = {
            mongodb: require('@cocreate/mongodb')
        }
        const crud = new crudServer(wsManager, databases, db)
        const render = new serverSideRender(crud);
        const file = new fileServer(crud, render)
        app.use('/', file.router)
        app.disable('x-powered-by');

        wsManager.authenticate = new authenticate(jwttoken)
        wsManager.authorize = new authorize(crud)

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