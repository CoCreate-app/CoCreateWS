module.exports = {
	organization_id: "",
	key: "",
	host: "",
	workers: 1, // Number of worker processes
	databases: {
		mongodb: require("@cocreate/mongodb")
	},
	modules: {
		"file-server": {
			path: "@cocreate/file-server",
			unload: false // true, false, number in milli seconds to wait before unloading
		},
		industry: {
			event: "industry",
			array: "files",
			object: {
				pathname: "/dist/industry-chunk.js"
			},
			unload: "10000"
		},
		openai: {
			event: "openai",
			path: "openai",
			initialize: "OpenAI",
			unload: "10000"
		},
		stripe: {
			event: "stripe",
			path: "stripe",
			initialize: "",
			unload: "10000"
		},
		postmark: {
			event: "postmark",
			path: "postmark",
			initialize: "ServerClient",
			unload: "10000"
		}
		// googleapis: {
		//     event: "googleapis",
		//     path: "googleapis",
		//     initialize: "auth.OAuth2",
		//     unload: "10000"
		// }
	},

	// Horizontal scaling configuration
	autoscaler: {
		horizontal: {
			enabled: true, // Enable or disable horizontal scaling
			memoryThreshold: "70%", // Memory usage threshold for scaling
			cpuThreshold: "70%", // CPU usage threshold for scaling
			serverType: "t2.medium", // Generic term for instance type
			maxServers: 10 // Maximum number of servers to scale out to
		},
		vertical: false // Vertical scaling not enabled
	},

	repositories: [
		{
			path: "../CoCreateWS",
			repo: "github.com/CoCreate-app/CoCreateWS.git",
			exclude: ["git"]
		},
		{
			path: "../CoCreate-components/CoCreate-acme",
			repo: "github.com/CoCreate-app/CoCreate-acme.git"
		},
		{
			path: "../CoCreate-components/CoCreate-authenticate",
			repo: "github.com/CoCreate-app/CoCreate-authenticate.git"
		},
		{
			path: "../CoCreate-components/CoCreate-authorize",
			repo: "github.com/CoCreate-app/CoCreate-authorize.git"
		},
		{
			path: "../CoCreate-components/CoCreate-cli",
			repo: "github.com/CoCreate-app/CoCreate-cli.git"
		},
		{
			path: "../CoCreate-components/CoCreate-cron-jobs",
			repo: "github.com/CoCreate-app/CoCreate-cron-jobs.git"
		},
		{
			path: "../CoCreate-components/CoCreate-crud-server",
			repo: "github.com/CoCreate-app/CoCreate-crud-server.git"
		},
		{
			path: "../CoCreate-components/CoCreate-file-server",
			repo: "github.com/CoCreate-app/CoCreate-file-server.git"
		},
		{
			path: "../CoCreate-components/CoCreate-loadtest",
			repo: "github.com/CoCreate-app/CoCreate-loadtest.git"
		},
		{
			path: "../CoCreate-components/CoCreate-lazy-loader",
			repo: "github.com/CoCreate-app/CoCreate-lazy-loader.git"
		},
		{
			path: "../CoCreate-components/CoCreate-metrics",
			repo: "github.com/CoCreate-app/CoCreate-metrics.git"
		},
		{
			path: "../CoCreate-plugins/CoCreate-mongodb",
			repo: "github.com/CoCreate-app/CoCreate-mongodb.git"
		},
		{
			path: "../CoCreate-plugins/CoCreate-nginx",
			repo: "github.com/CoCreate-app/CoCreate-nginx.git"
		},
		{
			path: "../CoCreate-components/CoCreate-node-autoscaler",
			repo: "github.com/CoCreate-app/CoCreate-node-autoscaler.git"
		},
		{
			path: "../CoCreate-components/CoCreate-notification",
			repo: "github.com/CoCreate-app/CoCreate-notification.git"
		},
		{
			path: "../CoCreate-components/CoCreate-server",
			repo: "github.com/CoCreate-app/CoCreate-server.git"
		},
		{
			path: "../CoCreate-components/CoCreate-server-side-render",
			repo: "github.com/CoCreate-app/CoCreate-server-side-render.git"
		},
		{
			path: "../CoCreate-components/CoCreate-socket-server",
			repo: "github.com/CoCreate-app/CoCreate-socket-server.git"
		},
		{
			path: "../CoCreate-components/CoCreate-sitemap",
			repo: "github.com/CoCreate-app/CoCreate-sitemap.git"
		},
		{
			path: "../CoCreate-components/CoCreate-usage",
			repo: "github.com/CoCreate-app/CoCreate-usage.git"
		},
		{
			path: "../CoCreate-components/CoCreate-actions",
			repo: "github.com/CoCreate-app/CoCreate-actions.git"
		},
		{
			path: "../CoCreate-components/CoCreate-cli",
			repo: "github.com/CoCreate-app/CoCreate-cli.git"
		},
		{
			path: "../CoCreate-components/CoCreate-config",
			repo: "github.com/CoCreate-app/CoCreate-config.git"
		},
		{
			path: "../CoCreate-components/CoCreate-crud-client",
			repo: "github.com/CoCreate-app/CoCreate-crud-client.git"
		},
		{
			path: "../CoCreate-components/CoCreate-docs",
			repo: "github.com/CoCreate-app/CoCreate-docs.git"
		},

		{
			path: "../CoCreate-components/CoCreate-elements",
			repo: "github.com/CoCreate-app/CoCreate-elements.git"
		},
		{
			path: "../CoCreate-components/CoCreate-industry",
			repo: "github.com/CoCreate-app/CoCreate-industry.git"
		},
		{
			path: "../CoCreate-components/CoCreate-observer",
			repo: "github.com/CoCreate-app/CoCreate-observer.git"
		},
		{
			path: "../CoCreate-plugins/CoCreate-openai",
			repo: "github.com/CoCreate-app/CoCreate-openai.git"
		},
		{
			path: "../CoCreate-components/CoCreate-organizations",
			repo: "github.com/CoCreate-app/CoCreate-organizations.git"
		},
		{
			path: "../CoCreate-components/CoCreate-render",
			repo: "github.com/CoCreate-app/CoCreate-render.git"
		},
		{
			path: "../CoCreate-components/CoCreate-sitemap",
			repo: "github.com/CoCreate-app/CoCreate-sitemap.git"
		},
		{
			path: "../CoCreate-components/CoCreate-socket-client",
			repo: "github.com/CoCreate-app/CoCreate-socket-client.git"
		},
		{
			path: "../CoCreate-plugins/CoCreate-stripe",
			repo: "github.com/CoCreate-app/CoCreate-stripe.git"
		},
		{
			path: "../CoCreate-components/CoCreate-unique",
			repo: "github.com/CoCreate-app/CoCreate-unique.git"
		},
		{
			path: "../CoCreate-components/CoCreate-url-uploader",
			repo: "github.com/CoCreate-app/CoCreate-url-uploader.git"
		},
		{
			path: "../CoCreate-components/CoCreate-users",
			repo: "github.com/CoCreate-app/CoCreate-users.git"
		},
		{
			path: "../CoCreate-components/CoCreate-utils",
			repo: "github.com/CoCreate-app/CoCreate-utils.git"
		},
		{
			path: "../CoCreate-components/CoCreate-uuid",
			repo: "github.com/CoCreate-app/CoCreate-uuid.git"
		}

		// Maybe depreciated
		// {
		//     'path': '../CoCreate-components/CoCreate-keepalived',
		//     'repo': 'github.com/CoCreate-app/CoCreate-keepalived.git'
		// },
		// {
		//     'path': '../CoCreate-components/CoCreate-mongodb-deployment',
		//     'repo': 'github.com/CoCreate-app/CoCreate-mongodb-deployment.git'
		// },
		// {
		//     'path': '../CoCreate-components/CoCreate-openebs',
		//     'repo': 'github.com/CoCreate-app/CoCreate-openebs.git'
		// },
		// {
		//     'path': '../CoCreate-components/CoCreate-ide',
		//     'repo': 'github.com/CoCreate-app/CoCreate-ide.git'
		// },
		// {
		//     'path': '../CoCreate-components/CoCreateEmail',
		//     'repo': 'github.com/CoCreate-app/CoCreateEmail.git'
		// },
	]
};
