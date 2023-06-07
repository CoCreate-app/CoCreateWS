const { config, database, db, jwttoken } = require('../CoCreate.config');
const socketServer = require("@cocreate/socket-server")
const crudServer = require('@cocreate/crud-server')
const fileServer = require('@cocreate/file-server')
const industry = require('@cocreate/industry')
const messageServer = require('@cocreate/message-server')
const metricsServer = require('@cocreate/metrics-server')
const organizations = require('@cocreate/organizations');
const serverSideRender = require('@cocreate/server-side-render');
const unique = require('@cocreate/unique');
const users = require('@cocreate/users');
const authenticate = require('@cocreate/authenticate')
const authorize = require("@cocreate/authorize");

module.exports.init = async function (server) {
    try {
        process.env['organization_id'] = config.organization_id;
        process.env['key'] = config.key;
        process.env['db'] = db

        const databases = {
            mongodb: require('@cocreate/mongodb')
        }
        const wsManager = new socketServer(server, 'ws')
        const crud = new crudServer(wsManager, databases, db)

        wsManager.authenticate = new authenticate(jwttoken)
        wsManager.authorize = new authorize(crud)

        new fileServer(server, crud, new serverSideRender(crud));
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