const socketServer = require("@cocreate/socket-server")
const crudServer = require('@cocreate/crud-server')
const fileServer = require('@cocreate/file-server')
const metrics = require('@cocreate/metrics')
const usage = require('@cocreate/usage')
const organizations = require('@cocreate/organizations');
const serverSideRender = require('@cocreate/server-side-render');
const sitemap = require('@cocreate/sitemap');
const unique = require('@cocreate/unique');
const users = require('@cocreate/users');
const authenticate = require('@cocreate/authenticate')
const authorize = require("@cocreate/authorize");
const Config = require("@cocreate/config");
const notification = require("@cocreate/notification");
const createDb = require('../installation/createDB');
const lazyLoader = require('@cocreate/lazy-loader');
const masterMap = require('./masterMap');
const nginx = require('@cocreate/nginx');
const cronJobs = require('@cocreate/cron-jobs');
const urlUploader = require('@cocreate/url-uploader');

module.exports.init = async function (cluster, server) {
    try {
        const proxy = new nginx(cluster)
        server.acme.proxy = proxy
        server.proxy = proxy

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
            wsManager.server = server

            const databases = {
                mongodb: require('@cocreate/mongodb')
            }

            const crud = new crudServer(wsManager, databases)
            server.acme.crud = crud
            server.crud = crud

            wsManager.authenticate = new authenticate(crud)
            wsManager.authorize = new authorize(crud)

            new lazyLoader(server, crud, new fileServer(new serverSideRender(crud), new sitemap(crud)));

            new metrics(crud);
            new notification(crud);
            new usage(crud);
            new unique(crud);
            new organizations(crud);
            new users(crud);
            new cronJobs(crud);
            new urlUploader(crud);
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