
const CoCreateBase = require("./base");
const {ObjectID, Binary} = require("mongodb");

class CoCreateUser extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init()
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('checkUnique',		(socket, data, roomInfo) => this.checkUnique(socket, data));
			this.wsManager.on('login',					(socket, data, roomInfo) => this.login(socket, data))
			this.wsManager.on('usersCurrentOrg',(socket, data, roomInfo) => this.usersCurrentOrg(socket, data))
			this.wsManager.on('fetchUser',			(socket, data, roomInfo) => this.fetchUser(socket, data))
			this.wsManager.on('userStatus',			(socket, data) => this.setUserStatus(socket, data))
		}
	}

	/**
		data = {
			namespace: string,	
			collection: string,
			request_id: string,
			name: string,
			value: any,
			
			apiKey: string,
			securityKey: string,
			organization_id: string
		}
	**/
	async checkUnique(socket, data) {
		const securityRes = await this.checkSecurity(data)
		const self = this;
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error');
			return;   
		}

		const collection = this.getCollection(data);
			
		const query = {
			[data['name']]: data['value']
		};
		
		if (securityRes['organization_id']) {
			query['organization_id'] = securityRes['organization_id'];
		}
		
		try {
			collection.find(query).toArray(function(error, result) {
				if (!error && result) {
					let response = {
						request_id: data['request_id'],
						name: data['name'],
						unique: false
					}
					if (result.length == 0) {
						response.unique = true;
					}
					self.wsManager.send(socket, 'checkedUnique', response)
				}
			})
		} catch (error) {
			console.log(error);
		}
	}
	
	/**
		data = {
			namespace:				string,	
			data-collection:	string,
			loginData:				object,
			eId:							string,
			form_id:					string,

			apiKey: string,
			securityKey: string,
			organization_id: string
		}
	**/	
	async login(socket, data) {
		const securityRes = await this.checkSecurity(data);
		const self = this;
		if (!securityRes.result) {
			self.wsManager.send(socket, 'securityError', 'error');
			return;   
		}
		
		try {
			
			const collection = self.getDB(data['namespace']).collection(data["data-collection"]);
			// const collection = this.getCollection(data)
			const query = new Object();
			
			if (securityRes['organization_id']) {
				query['organization_id'] = securityRes['organization_id'];
			}
			
			// query['connected_orgs'] = data['organization_id'];
			
			// if (data['data-document_id']) {
			//   query['data-document_id'] = new ObjectID(data['data-module']);
			// } 
			
			for (var key in data['loginData']) {
				query[key] = data['loginData'][key];
			}
			
			collection.find(query).toArray(function(error, result) {
				let response = {
					form_id: data['form_id'],
					success: false,
					message: "We can't login",
					status: "failure"
				}
				if (!error && result && result.length > 0) {
					response = {
						eId: data['eId'],
						success: true,
						id: result[0]['_id'],
						current_org: result[0]['current_org'],
						message: "Login successfuly",
						status: "success"
					};
				} 
				self.wsManager.send(socket, 'login', response)
			});
		} catch (error) {
			console.log(error);
		}
	}
	
	/**
		data = {
			namespace:				string,	
			data-collection:	string,
			user_id:					string,
			href: string
		}
	**/		
	async usersCurrentOrg(socket, data) {
		try {
			const self = this;
			const collection = this.getDB(data['namespace']).collection(data["data-collection"]);
			// const collection = this.getCollection(data)
			let query = new Object();
			
			query['_id'] = new ObjectID(data['user_id']);
			
			collection.find(query).toArray(function(error, result) {
			
				if (!error && result && result.length > 0) {
					
					if (result.length > 0) {
						let org_id = result[0]['current_org'];
						const orgCollection = self.getDB(data['namespace']).collection('organizations');
						// const collection = this.getCollection(data)
						
						orgCollection.find({"_id": new ObjectID(org_id),}).toArray(function(err, res) {
							if (!err && res && res.length > 0) {
								self.wsManager.send(socket, 'usersCurrentOrg', {
									success:			true,
									user_id:			result[0]['_id'],
									current_org:	result[0]['current_org'],
									apiKey: 			res[0]['apiKey'],
									securityKey:	res[0]['securityKey'],
									adminUI_id: 	res[0]['adminUI_id'],
									builderUI_id: res[0]['builderUI_id'],
									href: data['href']
								})
							}
						});
					}
				} else {
					// socket.emit('loginResult', {
					//   form_id: data['form_id'],
					//   success: false
					// });
				}
			});
		} catch (error) {
			
		}
	}

	/**
		data = {
			namespace:				string,	
			data-collection:	string,
			user_id:					object,

			apiKey: string,
			securityKey: string,
			organization_id: string
		}
	**/		
	async fetchUser(socket, data) {
		const self = this;
		const securityRes = await this.checkSecurity(data);
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error');
			return;   
		}
		
		try {
			const collection = self.getDB(data['namespace']).collection(data['data-collection']);
			// const collection = this.getCollection(data)
			const user_id = data['user_id'];
			const query = {
				"_id": new ObjectID(user_id),
			}
			
			if (securityRes['organization_id']) {
				query['organization_id'] = securityRes['organization_id'];
			}
			
			collection.findOne(query, function(error, result) {
				if (!error) {
					self.wsManager.send(socket, 'fetchedUser', result);
				}
			})
		} catch (error) {
			console.log('fetchUser error')
		}
	}
	
	/**
	 * status: 'on/off/idle'
	 */
	async setUserStatus(socket, data) {
		const self = this;
		const {info, status} = data;

		const items = info.split('/');

		if (items[0] !== 'users') {
			return;
		}
		
		if (!items[1]) return;

		try {
			const collection = self.getDB().collection('users');
			// const collection = this.getCollection(data)
			const user_id = items[1];
			const query = {
				"_id": new ObjectID(user_id),
			}
			collection.update(query, {$set: {status: status}}, function(err, res) {
				if (!err) {
					console.log('update success! ', user_id)
					// self.wsManager.send(socket, 'changeUser', result);
					self.wsManager.broadcast(socket, '', null, 'changedUserStatus', 
					{
						user_id,
						status
					})
				}
			})
		} catch (error) {
			console.log('fetchUser error')
		}
	}
}

module.exports = CoCreateUser;