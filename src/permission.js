const CoCreatePermission = require('@cocreate/permissions');
// const mongodb = require('@cocreate/mongodb');
const {ObjectID} = require("mongodb");


class ServerPermission extends CoCreatePermission {
  constructor(db_client) {
    super()
    this.dbClient = db_client;
  }
  
  getParameters(action, data) {
		const { apiKey, organization_id, collection } = data;
		return {
			apikey: apiKey,
			organization_id,
			key: 'collections',
			key_value: collection,
			type: action
		}
  }
  
	async getPermissionObject(key, organization_id) {
		
		try {
			if (!organization_id) {
				return null;
			}

			const db = this.dbClient.db(organization_id)
			if (!db)  {
				return null;
			}
			const collection = db.collection('permissions');
			if (!collection) {
				return null;
			}

			let permission = await collection.findOne({
				apikey: key,
				type: 'apikey'
			});
			
			if (!permission.collections) {
				permission.collections = {};
			}

			if (permission && permission.roles) {
				const role_ids = permission.roles.map((x) => ObjectID(x));

				let roles = await collection.find({
					_id: { $in: role_ids }
				}).toArray()

				roles.map(role =>  {
					if (role.collections) {
						for (const c in role.collections) {
							if (permission.collections[c]) {
								permission.collections[c] = [...new Set([...permission.collections[c], ...role.collections[c]])]
							}
						}
					}
				})
			}
			console.log('WS permission fetch data----', permission)

			return permission;
		} catch (error) {
			return null;
		}
		
	}
}

module.exports = ServerPermission;
