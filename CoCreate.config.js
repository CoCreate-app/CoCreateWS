module.exports = {
    "organization_id": "",
    "key": "",
    "host": "",
    "directories": [
        {
            "entry": "./superadmin",
            "array": "files",
            "object": {
                "name": "{{name}}",
                "src": "{{source}}",
                "host": [
                    "*",
                    "general.cocreate.app"
                ],
                "directory": "{{directory}}",
                "path": "{{path}}",
                "pathname": "{{pathname}}",
                "content-type": "{{content-type}}",
                "public": "true"
            }
        }
    ],
    "repositories": [

        // Servers
        {
            'path': '../CoCreateWS',
            'repo': 'github.com/CoCreate-app/CoCreateWS.git',
            'exclude': ['git']
        },
        // {
        //     'path': '../CoCreateApi',
        //     'repo': 'github.com/CoCreate-app/CoCreateApi.git'
        // },
        // {
        //     'path': '../CoCreateLB',
        //     'repo': 'github.com/CoCreate-app/CoCreateLB.git'
        // },


        // Components
        {
            'path': '../CoCreate-components/CoCreate-authenticate',
            'repo': 'github.com/CoCreate-app/CoCreate-authenticate.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-authorize',
            'repo': 'github.com/CoCreate-app/CoCreate-authorize.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-crud-server',
            'repo': 'github.com/CoCreate-app/CoCreate-crud-server.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-file-server',
            'repo': 'github.com/CoCreate-app/CoCreate-file-server.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-loadtest',
            'repo': 'github.com/CoCreate-app/CoCreate-loadtest.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-message-server',
            'repo': 'github.com/CoCreate-app/CoCreate-message-server.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-metrics-server',
            'repo': 'github.com/CoCreate-app/CoCreate-metrics-server.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-mongodb',
            'repo': 'github.com/CoCreate-app/CoCreate-mongodb.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-node-autoscaler',
            'repo': 'github.com/CoCreate-app/CoCreate-node-autoscaler.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-server-side-render',
            'repo': 'github.com/CoCreate-app/CoCreate-server-side-render.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-socket-server',
            'repo': 'github.com/CoCreate-app/CoCreate-socket-server.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-actions',
            'repo': 'github.com/CoCreate-app/CoCreate-actions.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-api',
            'repo': 'github.com/CoCreate-app/CoCreate-api.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-cli',
            'repo': 'github.com/CoCreate-app/CoCreate-cli.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-config',
            'repo': 'github.com/CoCreate-app/CoCreate-config.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-crud-client',
            'repo': 'github.com/CoCreate-app/CoCreate-crud-client.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-docs',
            'repo': 'github.com/CoCreate-app/CoCreate-docs.git'
        },

        {
            'path': '../CoCreate-components/CoCreate-elements',
            'repo': 'github.com/CoCreate-app/CoCreate-elements.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-industry',
            'repo': 'github.com/CoCreate-app/CoCreate-industry.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-observer',
            'repo': 'github.com/CoCreate-app/CoCreate-observer.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-organizations',
            'repo': 'github.com/CoCreate-app/CoCreate-organizations.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-render',
            'repo': 'github.com/CoCreate-app/CoCreate-render.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-socket-client',
            'repo': 'github.com/CoCreate-app/CoCreate-socket-client.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-unique',
            'repo': 'github.com/CoCreate-app/CoCreate-unique.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-users',
            'repo': 'github.com/CoCreate-app/CoCreate-users.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-utils',
            'repo': 'github.com/CoCreate-app/CoCreate-utils.git'
        },
        {
            'path': '../CoCreate-components/CoCreate-uuid',
            'repo': 'github.com/CoCreate-app/CoCreate-uuid.git'
        },



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

}