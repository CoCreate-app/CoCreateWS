
const CoCreateBase = require("./base");
const {ObjectID, Binary} = require("mongodb");

class CoCreateOrganization extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init()
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('createOrg',		(socket, data, roomInfo) => this.createOrg(socket, data));
			this.wsManager.on('createUser',		(socket, data, roomInfo) => this.createUser(socket, data));
			this.wsManager.on('deleteOrg',		(socket, data, roomInfo) => this.deleteOrg(socket, data));
			
			this.wsManager.on('runIndustry',	(socket, data, roomInfo) => this.runIndustry(socket, data));
			this.wsManager.on('createIndustryNew',	(socket, data, roomInfo) => this.createIndustry(socket, data));
		}
	}

	async createOrg(socket, data) {
		const self = this;
		if(!data.data) return;
		
		try{
			const collection = this.getCollection(data);
			collection.insertOne(data.data, function(error, result) {
				if(!error && result){
					const orgId = result.ops[0]._id + "";
					const anotherCollection = self.getDB(orgId).collection(data['collection']);
					anotherCollection.insertOne(result.ops[0]);
					
					const response  = {
						'db': data['db'],
						'collection': data['collection'],
						'element': data['element'],
						'document_id': result.ops[0]._id,
						'data': result.ops[0],
						'metadata': data['metadata'],
					}
					self.wsManager.send(socket, 'createOrg', response);
					if (data.room) {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'] , data.room, 'createDocument', response, true);
					} else {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'], null, 'createDocument', response)	
					}
				}
			});
		}catch(error){
			console.log('createDocument error', error);
		}
	}
	
	async createUser(socket, data) {
		const self = this;
		if(!data.data) return;
		
		try{
			const collection = this.getCollection(data);
			collection.insertOne(data.data, function(error, result) {
				if(!error && result){
					const copyDB = data.copyDB;
					if (copyDB) {
						const anotherCollection = self.getDB(copyDB).collection(data['collection']);
						anotherCollection.insertOne(result.ops[0]);
					}

					const response  = {
						'db': data['db'],
						'collection': data['collection'],
						'element': data['element'],
						'document_id': result.ops[0]._id,
						'data': result.ops[0],
						'metadata': data['metadata'],
					}
					self.wsManager.send(socket, 'createUser', response);
					// if (data.room) {
					// 	self.wsManager.broadcast(socket, data.namespace || data['organization_id'] , data.room, 'createDocument', response, true);
					// } else {
					// 	self.wsManager.broadcast(socket, data.namespace || data['organization_id'], null, 'createDocument', response)	
					// }
				}
			});
		}catch(error){
			console.log('createDocument error', error);
		}
	}
	
	async deleteOrg(socket, data) {
		const self = this;
		if(!data.data) return;
		
		try{
			const collection = this.getCollection(data);
			return;
			collection.insertOne(data.data, function(error, result) {
				if(!error && result){
					const orgId = result.ops[0]._id + "";
					const anotherCollection = self.getDB(orgId).collection(data['collection']);
					anotherCollection.insertOne(result.ops[0]);
					
					const response  = {
						'db': data['db'],
						'collection': data['collection'],
						'element': data['element'],
						'document_id': result.ops[0]._id,
						'data': result.ops[0],
						'metadata': data['metadata'],
					}
					self.wsManager.send(socket, 'createOrg', response);
					if (data.room) {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'] , data.room, 'createDocument', response, true);
					} else {
						self.wsManager.broadcast(socket, data.namespace || data['organization_id'], null, 'createDocument', response)	
					}
				}
			});
		}catch(error){
			console.log('createDocument error', error);
		}
	}
	
	/**
	 * Run Industry logic
	 **/
	async runIndustry(socket, data) {
		const {industry_id, new_organization_id, db} = data
		let industryDocumentsCollection = this.getDB(db).collection('industry_documents');

		//. get old_subdomain and new_subdomain
		let industry = await this.getDB(db).collection('industries').findOne({_id: ObjectID(industry_id)});
		let newOrgDocument = await this.getDB(db).collection('organizations').findOne({_id: ObjectID(new_organization_id)});
		
		let subdomain = industry && industry.subdomain ? industry.subdomain : "";
		let new_subdomain = newOrgDocument && newOrgDocument.domains ? newOrgDocument.domains[0] : "";
		
		const {adminUI_id, builderUI_id, idPairs} = await this.createEmptyDocumentsFromIndustry(
			industryDocumentsCollection, 
			industry_id, 
			new_organization_id, 
			subdomain, 
			new_subdomain
		);
		
		await this.updateDocumentsByIndustry(idPairs, new_organization_id)
		this.wsManager.send(socket, 'runIndustry', {
			adminUI_id,
			builderUI_id,
			industry_id
		})
	}
	
	async createEmptyDocumentsFromIndustry(industryDocumentsCollection, industry_id, newOrgId, old_subdomain, new_subdomain) {
		const newDB = this.getDB(newOrgId);
		const self = this;
		let adminUI_id = '';
		let builderUI_id = '';
		let idPairs = [];
		
		let documentCursor = industryDocumentsCollection.find({"industry_data.industry_id" : industry_id})
		
		while(await documentCursor.hasNext()) {
			let document = await documentCursor.next();
			const {collection, document_id, industry_id} = document.industry_data || {}
			if (!collection || !document_id) {
				continue;
			}
			const collectionInstance = newDB.collection(collection);

			document['organization_id'] = newOrgId;
			
			delete document['_id'];
			delete document['industry_data'];
			
			//. replace subdomain
			if (old_subdomain && new_subdomain) {
				for (let field in document) {
					if (field != '_id' && field != 'organization_id') {
						document[field] = self.replaceContent(document[field], old_subdomain, new_subdomain);
					}
				}
			}

			let newDocument = await collectionInstance.insertOne(document);
			if (newDocument) {
				if (newDocument['ops'][0].name == 'Admin UI') {
					adminUI_id = newDocument['ops'][0]['_id'];
				} else if (newDocument['ops'][0].name == 'Builder UI') {
					builderUI_id = newDocument['ops'][0]['_id'];
				}
				
				idPairs.push({
					new_id : newDocument['ops'][0]['_id'].toString(),
					old_id : document_id,
					collection_name: collection
				})
			}		
		}
		// console.log(idPairs);
		// console.log(idPairs.length);
		
		return {
			adminUI_id: adminUI_id,
			builderUI_id: builderUI_id,
			idPairs: idPairs
		}
	}
	
	async updateDocumentsByIndustry(idPairs, newOrgId) {
		const newDB = this.getDB(newOrgId);
		
		for (let i = 0; i < idPairs.length; i++) {
			const {collection_name, new_id} = idPairs[i];
			const collection = newDB.collection(collection_name);
			
			let document = await collection.findOne({'_id': ObjectID(new_id)});
			
			for (let field in document) {
				if (field != '_id' && field != 'organization_id') {
					var newFieldValue = this.replaceId(document[field], idPairs);
					document[field] = newFieldValue;
				}
			}
			
			delete document['_id'];
			await collection.findOneAndUpdate({'_id': ObjectID(new_id)}, {$set: document});
		}
	}
	
	replaceId(fieldValue, idPairs) {
		const self = this;
		idPairs.forEach(({old_id, new_id}) => {
			fieldValue = self.replaceContent(fieldValue, old_id, new_id)
		})
		return fieldValue;
	}
	
	replaceContent(content, src, target) {
		const type = typeof content
		if (type == 'string') {
			content = content.replace(new RegExp(src, 'g'), target);
		} else if (type == "object") {
			for (let key in content) {
				if (content[key] && typeof content[key] == 'string') {
					content[key] = content[key].replace(new RegExp(src, 'g'), target);
				}
			}
		}
		return content
	}
	
	/**
	 * Create industry
	 **/
	async createIndustry(socket, data)
	{
		try {
			const {organization_id, db} = data;
			const self = this;
			const collection = this.getCollection(data);
			
			let orgDocument = await this.getDB(db).collection('organizations').findOne({_id: ObjectID(organization_id)});
			let subdomain = orgDocument && orgDocument.domains ? orgDocument.domains[0] : "";
			
			let insertData = data.data;
			if (!insertData.subdomain) {
				insertData.subdomain = subdomain;
			}

			let insertResult = await collection.insertOne(insertData);
			console.log(insertResult.ops[0])
			
			const industry_id = insertResult.ops[0]._id + "";
			const anotherCollection = self.getDB(organization_id).collection(data['collection']);
			anotherCollection.insertOne(insertResult.ops[0]);
			
			//. create inustryDocuments
			const srcDB = this.getDB(organization_id);
			let collections = []
			const exclusion_collections = ["users", "organizations", "industries", "industry_documents", "crdt-transactions", "metrics"];
			collections = await srcDB.listCollections().toArray()
			collections = collections.map(x => x.name)

			for (let i = 0; i < collections.length; i++) {
				let collection = collections[i];
				if (exclusion_collections.indexOf(collection) > -1) {
					continue;
				}
				await self.insertDocumentsToIndustry(collection, industry_id, organization_id, db);
			}
			
			//. update subdomain
			const response  = {
				'db': data['db'],
				'organization_id': organization_id,
				'industry_id': industry_id,
				'data': collections,
				'metadata': data['metadata'],
			}
			
			console.log(response)
			self.wsManager.send(socket, 'createIndustryNew', response);

			
		} catch (error) {
			console.log(error)
		}
	}

	async insertDocumentsToIndustry(collectionName, industryId, organizationId, targetDB) {
		try{
			const industryDocumentsCollection = this.getDB(targetDB).collection('industry_documents');
			const collection = this.getDB(organizationId).collection(collectionName);
			const  query = {
				'organization_id': organizationId
			}

			const documentCursor = collection.find(query);
			await documentCursor.forEach(async (document) => {
				var documentId = document['_id'].toString();
	
				delete document['_id'];
				
				document['industry_data'] = {
					document_id: documentId,
					industry_id: industryId,
					collection: collectionName 
				}

				industryDocumentsCollection.update(
					{
						"industry_data.document_id" : {$eq: documentId},
						"industry_data.industry_id" : {$eq: industryId},
						"industry_data.collection"	: {$eq: collectionName},
					},
					{ 
						$set: document
					},
					{
						upsert: true
					}
				);
			})
		}
		catch (e) {
			console.log(e)
		}
	}

}

module.exports = CoCreateOrganization;