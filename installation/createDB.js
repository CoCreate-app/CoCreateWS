// TODO: replace mongodb with @cocreate/crud  to support multiple databases
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../CoCreate.config');
const uuid = require('@cocreate/uuid');

const fs = require('fs');
const path = require("path")

let dbUrl = config.database.url[0]
if (dbUrl)
    update(dbUrl)

async function update(dbUrl) {
    const dbClient = await MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    const organization_id = config.organization._id || config.config.organization_id || `${ObjectId()}`
    const key = config.organization.key || config.config.key || uuid.generate(32);
    const user_id = config.user._id || `${ObjectId()}`;

    console.log(organization_id, key, user_id)

    try {
        // Create organization 
        const organizations = dbClient.db(organization_id).collection('organizations');

        let organization = config.organization;
        organization._id = ObjectId(organization_id);
        organization.hosts = config.organization.hosts
        organization.databases = {
            mongodb: { name: config.database.name, url: config.database.url }
        }
        organization.apis = {
            stripe: {
                environment: "test",
                test: "",
                production: ""
            }
        }
        organization.organization_id = organization_id;
        await organizations.insertOne(organization);

        // Create user
        const users = dbClient.db(organization_id).collection('users');
        let user = config.user;
        user['_id'] = ObjectId(user_id);
        user['organization_id'] = organization_id;
        await users.insertOne(user);

        // Create default key
        const permissions = dbClient.db(organization_id).collection('keys');
        let data = {
            type: "key",
            key: key,
            hosts: [
                "*"
            ],
            actions: {
                "signIn": "",
                "signUp": ""
            },
            default: true,
            organization_id
        }
        await permissions.insertOne(data);

        // Create admin role
        let role = {
            _id: ObjectId(),
            type: "role",
            name: "admin",
            admin: "true",
            hosts: ["*"],
            organization_id: organization_id
        };
        await permissions.insertOne(role);

        // Create user key
        let userKey = {
            type: "user",
            key: user_id,
            roles: [role._id],
            organization_id: organization_id
        };
        await permissions.insertOne(userKey);

        if (organization_id && key)
            updateConfig(organization_id, key)


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
    if (!object.config) {
        let obj = {}
        obj['config'] = {}
        object = { ...obj, ...object }
    }
    Object.assign(object.config, { organization_id })
    Object.assign(object.config, { key })
    delete object.organization
    delete object.user

    let config = `module.exports = ${JSON.stringify(object, null, 4)}`

    if (fs.existsSync(configfile))
        fs.unlinkSync(configfile)
    fs.writeFileSync(configfile, config)

    console.log('updated: ', configfile)
    process.exit()

}
