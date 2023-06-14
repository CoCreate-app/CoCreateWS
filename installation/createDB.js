const Config = require('@cocreate/config')
const uuid = require('@cocreate/uuid');
const crudServer = require('@cocreate/crud-server')

const fs = require('fs');
const path = require("path")

module.exports = async function () {

    let config = await Config({
        'name': {
            prompt: 'Enter a friendly name for the new storage: ',
            variable: true
        },
        'storage.{{name}}.provider': {
            prompt: 'Enter the storage provider, ex mongodb: '
        },
        'storage.{{name}}.url': {
            prompt: 'Enter the storage providers url: '
        }
    })

    const storage = {}
    if (!config.name && !config.provider && !config.url) {
        console.log('Could not find a url in your storage object')
        process.exit()
    }


    storage[config.name] = { provider: config.provider, url: config.url }
    update()

    async function update() {
        const organization_id = config.organization_id || `${crudServer.ObjectId()}`
        const key = config.key || uuid.generate(32);
        const user_id = config.user_id || `${crudServer.ObjectId()}`;

        console.log(organization_id, key, user_id)

        try {
            // Create organization 
            await crudServer.createDocument({
                database: organization_id,
                collection: 'organizations',
                document: {
                    _id: ObjectId(organization_id),
                    host: config.host,
                    storage: config.storage,
                    organization_id
                },
                organization_id
            })

            // Create user
            await crudServer.createDocument({
                database: organization_id,
                collection: 'users',
                document: {
                    _id: ObjectId(user_id),
                    firstname: 'Admin',
                    organization_id
                },
                organization_id
            })


            // Create default key
            await crudServer.createDocument({
                database: organization_id,
                collection: 'keys',
                document: {
                    type: "key",
                    key: key,
                    actions: {
                        "signIn": "",
                        "signUp": ""
                    },
                    default: true,
                    organization_id
                },
                organization_id
            })

            // Create admin role
            let role_id = crudServer.ObjectId();
            await crudServer.createDocument({
                database: organization_id,
                collection: 'keys',
                document: {
                    _id: role_id,
                    type: "role",
                    name: "admin",
                    admin: "true",
                    organization_id
                },
                organization_id
            })


            // Create user key
            await crudServer.createDocument({
                database: organization_id,
                collection: 'keys',
                document: {
                    type: "user",
                    key: user_id,
                    roles: [role_id],
                    organization_id
                },
                organization_id
            })

            if (organization_id && key) {
                updateConfig(organization_id, key)
                return organization_id
            }

        } catch (error) {
            console.log(error)
        }
    }

    function updateConfig(organization_id, key) {
        const ppath = './'
        let configfile = path.resolve(ppath, 'CoCreate.config.js');
        if (!fs.existsSync(configfile))
            return console.error('path does not exist:', configfile)

        let object = require(configfile)
        object.organization_id = organization_id
        object.key = key

        let config = `module.exports = ${JSON.stringify(object, null, 4)}`

        if (fs.existsSync(configfile))
            fs.unlinkSync(configfile)
        fs.writeFileSync(configfile, config)

        console.log('updated: ', configfile)
        process.exit()

    }
}
