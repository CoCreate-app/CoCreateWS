const { ObjectId } = require("mongodb");
const { mongoClient } = require("../src/db")
const config = require('../CoCreate.config');
const CoCreateUUID = require('@cocreate/uuid');
// const { updateConfig } = require('./updateConfig');

const fs = require('fs');
const path = require("path")
const prettier = require("prettier");

mongoClient().then(dbClient => {
	update(dbClient)
});

async function update(dbClient){
	const organization_id = `${ObjectId()}`
	const apiKey = CoCreateUUID.generate(32);
	let user_id = '';

	try {
		// Create organization 
		const organizations = dbClient.db(organization_id).collection('organizations');

		let organization = config.organization;
		organization.organization_id = organization_id;
		organization.apiKey = apiKey;
		await organizations.insertOne(organization);

		// Create apiKey permission
		if (organization_id && apiKey) {
			const permissions = dbClient.db(organization_id).collection('permissions');
			let data = {
				organization_id: organization_id,
				type: "apikey",
				key: apiKey,
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
				"modules": {
					"actions": [
						"login",
						"signin",
						"registerUser",
						"userCurrentOrg",
						"createUser",
						"createOrg",
						"runIndustry"
					],
					"sendgrid": ["sendEmail"]
				},
				"super_admin": "true"
			}
			await permissions.insertOne(data);
		}

		// Create user
		if (organization_id) {
			const users = dbClient.db(organization_id).collection('users');
			let user = config.user;
			user['password'] = encryptPassword(user.password);
			user['connected_orgs'] = [organization_id];
			user['current_org'] = organization_id;
			user['organization_id'] = organization_id;
			let response = await users.insertOne(user);
			user_id = `${response.insertedId}`;
		}

		// Create role permission
		if (user_id) {
			const permissions = dbClient.db(organization_id).collection('permissions');
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
				"super_admin": "false",
				"hosts": ["*"]
			};
			let response = await permissions.insertOne(role);
			let role_id = `${response.insertedId}`;
			
			// Create user permission
			if (role_id) {
				const permissions = dbClient.db(organization_id).collection('permissions');
				let data = {
					"organization_id": organization_id,
					"type": "user_id",
					"key": user_id,
					"roles": [role_id]
				};
				await permissions.insertOne(data);
			}
		}	

		if (organization_id && apiKey)
			updateConfig(organization_id, apiKey)
		
		
	} catch (error) {
		console.log(error)
	}
}

function encryptPassword(str) {
	let encodedString = btoa(str);
	return encodedString;
}

function updateConfig(organization_id, apiKey) {
    const ppath = './'
    let configfile = path.resolve(ppath, 'CoCreate.config.js');
    if(!fs.existsSync(configfile))
        return console.error('path does not exist:', configfile)
    
    let object = require(configfile)
	if (!object.config) {
		let obj = {}
		obj['config'] = {}
		object = {...obj, ...object}
	}
    Object.assign(object.config, {organization_id})
    Object.assign(object.config, {apiKey})
    delete object.organization
    delete object.user
    let str = JSON.stringify(object)
    let formated = prettier.format(str, { semi: false, parser: "json" });
    let config = `module.exports = ${formated}`

    if (fs.existsSync(configfile))
        fs.unlinkSync(configfile)
    fs.writeFileSync(configfile, config)
    
    console.log('updated: ', configfile)
	process.exit()

}
