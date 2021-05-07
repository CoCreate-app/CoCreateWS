const CoCreatePermission = require('@cocreate/permissions');
// const mongodb = require('@cocreate/mongodb');
const {ObjectID} = require("mongodb");


class ServerPermission extends CoCreatePermission {
  constructor(db_client) {
    super()
    this.dbClient = db_client;
    this.initEvent()
  }
  
  getParameters(action, data) {
		const { apiKey, organization_id, collection, document_id } = data;
		return {
			apikey: apiKey,
			organization_id,
			collection,
			plugin: 'messages',
			type: action,
			document_id
		}
  }
  
  initEvent() {
    const self = this;
    process.on('changed-document', async (data) => {
      const {collection, document_id, organization_id, data : permissionData } = data
      
      if (collection === 'permissions' && self.hasPermission(permissionData.key)) {
        let new_permission = await self.getPermissionObject(permissionData.key, organization_id, permissionData.type)
        self.setPermissionObject(permissionData.key, new_permission)
      }
    })
  }
  
	async getPermissionObject(key, organization_id, type) {
		
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
				key,
				type: type || 'apikey'
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
		
		// console.log('WS permission fetch data----', permission)

			return permission;
		} catch (error) {
		  console.log("Error en permission")
			return null;
		}
		
	}
}

module.exports = ServerPermission;
