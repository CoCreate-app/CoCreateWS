
const {ObjectID, Binary} = require("mongodb");
const CoCreateBase = require("../core/CoCreateBase");
const {encodeObject, decodeObject, replaceArray} = require("./utils.crud.js")


class CoCreateCrud extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('createDocument', 	(socket, data, roomInfo) => this.createDocument(socket, data, roomInfo));
			this.wsManager.on('readDocument',		(socket, data, roomInfo) => this.readDocument(socket, data, roomInfo))
			this.wsManager.on('updateDocument', 	(socket, data, roomInfo) => this.updateDocument(socket, data, roomInfo))
			this.wsManager.on('deleteDocument', 	(socket, data, roomInfo) => this.deleteDocument(socket, data, roomInfo))
		}
	}

/** Create Document **/ 
	/*
	that.wsManager.onMessage(socket, "createDocument", data, roomInfo)
	
	that.wsManager.onMessage(socket, "readDocument", data, roomInfo)
	
	that.wsManager.onMessage(socket, "updateDocument", data, roomInfo)
		Example:
		that.wsManager.onMessage(socket, "updateDocument", {
			namespace: '',
			room: '',
			broadcast: true/false,
			broadcast_sender: true/false,
			
			collection: "test123",
			document_id: "document_id",
			data:{
			
				name1:“hello”,
				name2: “hello1”
			},
			delete_fields:["name3", "name4"],
			element: “xxxx”,
			metaData: "xxxx"
			}, roomInfo)
			
	that.wsManager.onMessage(socket, "deleteDocument", data, roomInfo)
	*/

	/** Create Document **/
	// data param needs organization_id field added to pass security check
	async createDocument(socket, data, roomInfo){
		const securityRes = await this.checkSecurity(data);
		const self = this;
		
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error', null, roomInfo);
			return;
		}
		
		if(!data.data) return;
		
		try{
			const collection = this.db.collection(data['collection']);
			let insertData = replaceArray(data.data);

			collection.insertOne(insertData, function(error, result) {
				if(!error && result){
					const response  = {
						'collection': data['collection'],
						'element': data['element'],
						'document_id': result.ops[0]._id,
						'data': result.ops[0],
						'metadata': data['metadata']
					};
					if (data.broadcast_sender !== false) {
						self.wsManager.send(socket, 'createDocument', response, data['organization_id'], roomInfo);
					}
					if (data.broadcast !== false) {
						if (data.room) {
							self.wsManager.broadcast(socket, data.namespace || data['organization_id'] , data.room, 'createDocument', response, true, roomInfo);
						} else {
							self.wsManager.broadcast(socket, data.namespace || data['organization_id'], null, 'createDocument', response, false, roomInfo)	
						}
					}
				}
			});
		}catch(error){
			console.log('createDocument error', error);
			this.wsManager.send(socket, 'ServerError', 'error', null, roomInfo);
		}
	}
	
	/** Read Document **/
	async readDocument(socket, data, roomInfo) {
		if (!data['collection'] || data['collection'] == 'null' || typeof data['collection'] !== 'string') {
			return;
		} 
		const self = this;
		const securityRes = await this.checkSecurity(data);
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error', null, roomInfo);
			return;   
		}
		
		try {
			
			const collection = this.db.collection(data["collection"]);
			
			const query = {
				"_id": new ObjectID(data["document_id"])
			};
			if (securityRes['organization_id']) {
				query['organization_id'] = securityRes['organization_id'];
			}
			
			collection.find(query).toArray(function(error, result) {
				if (!error && result) {
					if (result.length > 0) {
						let tmp = result[0];
						if (data['exclude_fields']) {
							data['exclude_fields'].forEach(function(field) {
								delete tmp[field];
							})
						}
						self.wsManager.send(socket, 'readDocument', {
							'collection'  : data['collection'],
							'document_id' : data['document_id'],
							'data'        : encodeObject(tmp),
							'element'	  : data['element'],
							'metadata'    : data['metadata']
						}, data['organization_id'], roomInfo);
					}
				} 
			});
		} catch (error) {
			console.log('readDocument error', error); 
			this.wsManager.send(socket, 'ServerError', 'error', null, roomInfo);
		}
	}

	/** Update Document **/
	async updateDocument(socket, data, roomInfo) {
		const  securityRes = await this.checkSecurity(data);
		const self = this;
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error', data['organization_id'], roomInfo);
			return;
		}
		
		try {
			
			const collection = this.db.collection(data["collection"]);
			const query = {"_id": new ObjectID(data["document_id"]) };
			
			const update = {};
			if( data['set'] )   update['$set'] = replaceArray(data['set']);
			if( data['unset'] ) update['$unset'] = data['unset'].reduce((r, d) => {r[d] = ""; return r}, {});
	
			collection.findOneAndUpdate(
				query,
				update,
				{
					returnOriginal : false,
					upsert: data.upsert || false
				}
			).then((result) => {
	
				let response = {
					'collection'  : data['collection'],
					'document_id' : data['document_id'],
					'data'        : encodeObject(result.value || {}),
					'metadata'    : data['metadata']
				};
				
				if(data['unset']) response['delete_fields'] = data['unset'];
				
				if (data.broadcast_sender != false) {
					self.wsManager.send(socket, 'updateDocument', { ...response, element: data['element']}, data['organization_id'], roomInfo);
				}
					
				if (data.broadcast !== false) {
					if (data.room) {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'] , data.room, 'updateDocument', response, true, roomInfo);
					} else {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'], null, 'updateDocument', response, false, roomInfo)	
					}
				}
			});
			
		} catch (error) {
			console.log(error)
			self.wsManager.send(socket, 'updateDocumentError', error, data['organization_id']);
		}
	}
	
	/** Delete Document **/
	async deleteDocument(socket, data, roomInfo) {
		const self = this;
		const securityRes = await this.checkSecurity(data);
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error', null, roomInfo);
			return;   
		}
	
		try {
			const collection = this.db.collection(data["collection"]);
			const query = {
				"_id": new ObjectID(data["document_id"])
			};
			// if (securityRes['organization_id']) {
			// 	query['organization_id'] = securityRes['organization_id'];
			// }
			
			collection.deleteOne(query, function(error, result) {
				if (!error) {
					let response = {
							'collection': data['collection'],
							'document_id': data['document_id'],
							'metadata': data['metadata']
						}
					if (data.broadcast_sender !== false) {
						self.wsManager.send(socket, 'deleteDocument', { ...response, element: data['element']}, data['organization_id'], roomInfo);
					}
					if (data.broadcast !== false) {
						if (data.room) {
							self.wsManager.broadcast(socket, data.namespace || data['organization_id'] , data.room, 'deleteDocument', response, true, roomInfo);
						} else {
							self.wsManager.broadcast(socket, data.namespace || data['organization_id'], null, 'deleteDocument', response, false, roomInfo)	
						}
					}
				}
			})
		} catch (error) {
			console.log(error);
			this.wsManager.send(socket, 'ServerError', 'error', null, roomInfo);
		}
	}
}

module.exports = CoCreateCrud;



