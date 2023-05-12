// const { ObjectId } = require("mongodb");
// TODO: replace with @cocreate/crud  to support multiple databases
const { MongoClient, ObjectId } = require('mongodb');
const config = require('../CoCreate.config');
const uuid = require('@cocreate/uuid');

const fs = require('fs');
const path = require("path")

let dbUrl = config.database.url[0]
if (dbUrl)
	update(dbUrl)
async function update(dbUrl) {
	let dbClient = await MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
	const organization_id = config.organization._id || config.config.organization_id || `${ObjectId()}`
	const key = config.organization.key || config.config.key || uuid.generate(32);
	let user_id = config.user._id;
	console.log(organization_id, key, user_id)

	// return ''
	try {
		// Create organization 
		const organizations = dbClient.db(organization_id).collection('organizations');

		let organization = config.organization;
		organization._id = ObjectId(organization_id);
		organization.key = key;
		organization.hosts = config.organization.hosts
		organization.databases = {
			mongodb: {name: config.database.name, url: config.database.url}
		}
		organization.apis = {
			stripe: {
				environment: "test",
				test: "",
				production:""
			}
		}
		organization.organization_id = organization_id;

		await organizations.insertOne(organization);

		// Create key permission
		if (organization_id && key) {
			const permissions = dbClient.db(organization_id).collection('keys');
			let data = {
				organization_id: organization_id,
				type: "key",
				key: key,
				hosts: [
					"*"
				],
				"collections": {
					"organizations": ["read"],
					"files": ["read"]
				},
				"documents": {
					"someid": {
						"permissions": [""],
						"fieldNames": {
							"name": ["read"]
						}
					}
				},
				"actions": {
					"signIn": "",
					"signUp": "",
					"createOrg": "",
					"runIndustry": "",
					"sendgrid": ["sendEmail"]
				},
				"admin": "true"
			}
			await permissions.insertOne(data);
		}

		// Create user
		if (organization_id) {
			const users = dbClient.db(organization_id).collection('users');
			let user = config.user;
			user['_id'] = ObjectId(user._id);
			user['password'] = btoa(user.password);
			user['connected_orgs'] = [organization_id];
			user['current_org'] = organization_id;
			user['organization_id'] = organization_id;
			let response = await users.insertOne(user);
			user_id = `${response.insertedId}`;
		}

		// Create role permission
		if (user_id) {
			const permissions = dbClient.db(organization_id).collection('keys');
			let role = {
				"organization_id": organization_id,
				"type": "role",
				"name": "admin",
				"collections": {
					"*": ["*"]
				},
				"modules": {
					"*": ""
				},
				"admin": "false",
				"hosts": ["*"]
			};
			let response = await permissions.insertOne(role);
			let role_id = `${response.insertedId}`;
			
			// Create user permission
			if (role_id) {
				const permissions = dbClient.db(organization_id).collection('keys');
				let data = {
					"organization_id": organization_id,
					"type": "user_id",
					"key": user_id,
					"roles": [role_id]
				};
				await permissions.insertOne(data);
			}
		}	

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
		object = {...obj, ...object}
	}
    Object.assign(object.config, {organization_id})
    Object.assign(object.config, {key})
    delete object.organization
    delete object.user

	let config = `module.exports = ${JSON.stringify(object, null, 4)}`

    if (fs.existsSync(configfile))
        fs.unlinkSync(configfile)
    fs.writeFileSync(configfile, config)
    
    console.log('updated: ', configfile)
	process.exit()

}
