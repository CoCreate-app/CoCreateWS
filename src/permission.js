const CoCreatePermission = require('@cocreate/permissions');
const {ObjectId} = require("mongodb");


class ServerPermission extends CoCreatePermission {
	constructor(dbClient) {
		super()
		this.dbClient = dbClient;
		this.initEvent()
	}
  
  	initEvent() {
		const self = this;
		process.on('changed-document', async (data) => {
			const {collection, document_id, organization_id, data : permissionData } = data
			
			if (collection === 'permissions' && self.hasPermission(permissionData.key)) {
				let new_permission = await self.getPermissionObject(permissionData.key, organization_id, permissionData.type)
				self.setPermission(permissionData.key, new_permission)
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
				const role_ids = []
				permission.roles.forEach((x) => {
					try {
						if (x) {
							role_ids.push(ObjectId(x))
						}
					} catch (err) {
						console.log(err)
					}
			  	})

				let roles = await collection.find({
					_id: { $in: role_ids }
				}).toArray()
				
				permission = this.createPermissionObject(permission, roles)
			}
		
			// console.log('WS permissions', permission)
			return permission;
		} catch (error) {
			console.log("Error en permission", )
			return null;
		}
		
	}
}

module.exports = ServerPermission;
