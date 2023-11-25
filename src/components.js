const socketServer = require("@cocreate/socket-server")
const crudServer = require('@cocreate/crud-server')
const fileServer = require('@cocreate/file-server')
const industry = require('@cocreate/industry')
const metrics = require('@cocreate/metrics')
const organizations = require('@cocreate/organizations');
const serverSideRender = require('@cocreate/server-side-render');
const unique = require('@cocreate/unique');
const users = require('@cocreate/users');
const authenticate = require('@cocreate/authenticate')
const authorize = require("@cocreate/authorize");
const Config = require("@cocreate/config");
const notification = require("@cocreate/notification");
const createDb = require('../installation/createDB');
// const lazyLoader = require('@cocreate/lazy-loader');
const masterMap = require('./masterMap');
const openai = require('@cocreate/openai');

module.exports.init = async function (cluster, server) {
    try {

        cluster.masterMap = () => new masterMap(cluster)

        let config = await Config({
            organization_id: {
                prompt: 'Enter your organization_id or continue and one will created: '
            }
        })

        if (!config.organization_id)
            config.organization_id = await createDb()

        if (config.organization_id) {
            const wsManager = new socketServer(server, 'ws')
            wsManager.cluster = cluster
            wsManager.authenticate = authenticate

            const databases = {
                mongodb: require('@cocreate/mongodb')
            }
            const crud = new crudServer(wsManager, databases)
            wsManager.authorize = new authorize(crud)

            new fileServer(server, crud, new serverSideRender(crud));
            new notification(crud);
            new metrics(crud);
            new unique(crud);
            new organizations(crud);
            new users(crud);
            new lazyLoader(crud);

            new openai(crud);
            // new industry(crud);

        } else {
            console.log('organization_id could not be found')
        }
    } catch (error) {
        console.error(error)
        return {
            status: false,
        }
    }
}