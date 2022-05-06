const { ObjectId } = require("mongodb");
const {mongoClient} = require("./db")
const config = require('../CoCreate.db');
const CoCreateUUID = require('@cocreate/uuid');

mongoClient().then(dbClient => {
	create(dbClient)
});

async function create(dbClient){
	const organization_id = `${ObjectId()}`
	const apiKey = CoCreateUUID.generate(32);
	let user_id = '';

	try {
		// Create organization 
		const organizations = dbClient.db(organization_id).collection('organizations');

		let update = {};
		update['$set'] = config.organization;
		update['$set'].organization_id = organization_id;
		update['$set'].apiKey = apiKey;

		let projection = {}
		Object.keys(update['$set']).forEach(x => {
			projection[x] = 1
		})

		const query = {"_id": new ObjectId(organization_id) };
		await organizations.findOneAndUpdate(query, update, {
			returnOriginal : false,
			upsert: true,
			projection: projection
		});

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
		
	} catch (error) {
		console.log(error)
	}
}

function encryptPassword(str) {
	let encodedString = btoa(str);
	return encodedString;
}
