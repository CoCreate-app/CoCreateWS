const CoCreatePermission = require('@cocreate/permissions');

class ServerPermission extends CoCreatePermission {
	constructor(crud) {
		super()
		this.crud = crud;
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
			if (!organization_id)
				return null;			

			let request = {
				collection: 'permissions',
				organization_id,
				filter: {
					query: [
						{name: 'key', value: key, operator: '$eq'},
						{name: 'type', value: type, operator: '$eq'}
					]
				}
			} 
			let permission = await this.crud.readDocument(request)
			permission = permission.document[0]

			if (!permission.collections) {
				permission.collections = {};
			}

			if (permission && permission.roles) {
				const role_ids = []
				permission.roles.forEach((_id) => {
					try {
						if (_id) {
							role_ids.push({_id})
						}
					} catch (err) {
						console.log(err)
					}
			  	})
				
				delete request.filter
				request.document =  role_ids
				
				let roles = await this.crud.readDocument(request)
				roles = roles.document

				permission = this.createPermissionObject(permission, roles)
			}
		
			// console.log('WS permissions', permission)
			return permission;
		} catch (error) {
			console.log("Permission Error")
			return null;
		}
		
	}
}

module.exports = ServerPermission;
