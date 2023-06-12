// TODO: replace mongodb with @cocreate/crud  to support multiple databases
const { MongoClient, ObjectId } = require('mongodb');
const cli = require('@cocreate/cli');
const uuid = require('@cocreate/uuid');

const fs = require('fs');
const path = require("path")
let config = await cli.config([
    {
        key: 'storage',
        prompt: 'Enter a JSON.stringify storage object'
    }
])

if (typeof config.storage === 'string')
    config.storage = JSON.parse(config.storage)
let databases = Object.keys(config.storage)
let dbUrl = databases[0].url[0]
if (dbUrl)
    update(dbUrl)
else {
    console.log('Could not find a url in your storage object')
    process.exit()
}


async function update(dbUrl) {
    const dbClient = await MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
    const organization_id = config.organization_id || `${ObjectId()}`
    const key = config.key || uuid.generate(32);
    const user_id = config.user_id || `${ObjectId()}`;

    console.log(organization_id, key, user_id)

    try {
        // Create organization 
        const organizations = dbClient.db(organization_id).collection('organizations');

        let organization = {};
        organization._id = ObjectId(organization_id);
        organization.host = config.host
        organization.storage = config.storage
        organization.organization_id = organization_id;
        await organizations.insertOne(organization);

        // Create user
        const users = dbClient.db(organization_id).collection('users');
        let user = {};
        user['_id'] = ObjectId(user_id);
        user['firstname'] = 'Admin'
        user['organization_id'] = organization_id;
        await users.insertOne(user);

        // Create default key
        const permissions = dbClient.db(organization_id).collection('keys');
        let data = {
            type: "key",
            key: key,
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
    object.organization_id = organization_id
    object.key = key

    let config = `module.exports = ${JSON.stringify(object, null, 4)}`

    if (fs.existsSync(configfile))
        fs.unlinkSync(configfile)
    fs.writeFileSync(configfile, config)

    console.log('updated: ', configfile)
    process.exit()

}
