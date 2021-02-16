
const CoCreateBase = require("../core/CoCreateBase");
const {ObjectID, Binary} = require("mongodb");

class CoCreateIndustry extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init()
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('createIndustry', (socket, data) => this.createIndustry(socket, data))
			this.wsManager.on('buildIndustry', (socket, data) => this.buildIndustry(socket, data))
			this.wsManager.on('fetchInfoForBuilder', (socket, data) => this.fetchInfoForBuilder(socket, data))
		}
	
	}
	
	async createIndustry(socket, data) {
		
		// var securityRes = await this.checkSecurity(data);
		// if (!securityRes.result) {
		//   this.wsManager.send(socket, 'securityError', 'error');
		//   return;   
		// }
		const self = this;
		try {
			console.log('createIndustry')
			const industryId = data['industry_id'];
			console.log(industryId)
			
			this.insertDocumentsToIndustry('module_activity', industryId, data['organization_id']);
			this.insertDocumentsToIndustry('modules', industryId, data['organization_id']);
			
			this.wsManager.send(socket, 'createdIndustry', {
				industry_id: industryId
			}, data['organization_id'])
			
		} catch (error) {
			console.log(error);
		}
	}
	
	async insertDocumentsToIndustry(collectionName, industryId, organizationId) {
		const industryDocumentsCollection = this.db.collection('industry_documents');
		const collection = this.db.collection(collectionName);
		const self = this;
		const  query = {
			'organization_id': organizationId
		}
		
		const documents = await collection.find(query).toArray();
		
		for (var i=0; i < documents.length; i++) {
			var document = documents[i];
			
			var documentId = document['_id'];
			
			delete document['_id'];
			
			document['document_id'] = documentId.toString();
			
			document['industry_id'] = industryId;
			document['collection_name'] = collectionName;
			
			industryDocumentsCollection.insertOne(document);
		}		
	}
	async buildIndustry(socket, data) {
		const securityRes = await this.checkSecurity(data);
		
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error', data['organization_id']);
			return;   
		}
		
		var industryDocumentsCollection = this.db.collection('industry_documents');
		var industryDocuments = await industryDocumentsCollection.find({"industry_id": data['industry_id']}).toArray();
		
		console.log('industry document count: ' + industryDocuments.length);
		
		var result = await this.createEmptyDocumentsFromIndustry(data['industry_id'], data['new_organization_id']);
		
		
		var adminUI_id = result.adminUI_id;
		var builderUI_id = result.builderUI_id;
		var idPairs = result.idPairs;

		await this.updateDocumentsByIndustry(idPairs);
		await this.removeFieldsForIndustry(idPairs);
		
		this.wsManager.send(socket, 'buildIndustry', {
			adminUI_id: adminUI_id,
			builderUI_id: builderUI_id,
			industry_id: data['industry_id']			
		}, data['organization_id'])

	}	

	async createEmptyDocumentsFromIndustry(industryId, newOrganizationId) {
		// var industryId = data['industry_id'];
		
		var industryDocumentsCollection = this.db.collection('industry_documents');
		
		var industryDocuments = await industryDocumentsCollection.find({"industry_id": industryId}).toArray();
	
		var adminUI_id = '';
		var builderUI_id = '';
		
		var idPairs = [];
		
		for (var i=0; i < industryDocuments.length; i++) {
			var document = industryDocuments[i];
			
			var collection = this.db.collection(document['collection_name']);
			
			delete document['_id'];
			delete document['organization_id'];
			delete document['industry_id'];
			
			document['old_document_id'] = document['document_id'];
			delete document['document_id'];
			
			var result = await collection.insertOne({
				organization_id: newOrganizationId,
				...document
			});
			
			if (result) {
				
				if (result['ops'][0].name == 'Admin UI') {
					adminUI_id = result['ops'][0]['_id'];
				} else if (result['ops'][0].name == 'Builder UI') {
					builderUI_id = result['ops'][0]['_id'];
				}
				
				idPairs.push({
					new_document_id: result['ops'][0]['_id'].toString(),
					old_document_id: result['ops'][0]['old_document_id'],
					collection_name: document['collection_name']
				})
			}
		}
	
		return {
			adminUI_id: adminUI_id,
			builderUI_id: builderUI_id,
			idPairs: idPairs
		}
	}	
	
	async updateDocumentsByIndustry(idPairs) {
	
		for (var i=0; i < idPairs.length; i++) {
			var idPair = idPairs[i];
			var collection = this.db.collection(idPair['collection_name']);
			var document = await collection.findOne({'_id': ObjectID(idPair['new_document_id'])});
			for (var field in document) {
				if (field != '_id' && field != 'organization_id' && field != 'collection_name' && field != 'old_document_id') {
					var fieldValue = document[field];
					var newFieldValue = this.replaceId(fieldValue, idPairs);
					document[field] = newFieldValue;
				}
			}
			
			delete document['_id'];
			await collection.findOneAndUpdate({'_id': ObjectID(idPair['new_document_id'])}, {$set: document});
		}
	}
	
	async removeFieldsForIndustry(idPairs) {
		for (var i=0; i < idPairs.length; i++) {
			var idPair = idPairs[i];
			var collection = this.db.collection(idPair['collection_name']);
			await collection.findOneAndUpdate({'_id': ObjectID(idPair['new_document_id'])}, {$unset: {"old_document_id": "", "collection_name": ""}});
		}
	}
	
	replaceId(fieldValue, idPairs) {
		var type = typeof fieldValue;
		if (type == 'string') {
			for (var i=0; i<idPairs.length; i++) {
				var idPair = idPairs[i];
				fieldValue = fieldValue.replace(new RegExp(idPair['old_document_id'], 'g'), idPair['new_document_id']);    
			}
		} else if (type == 'object') {
			for (var key in fieldValue) {
				for (var i=0; i<idPairs.length; i++) {
					var idPair = idPairs[i];
					if (fieldValue[key]) fieldValue[key] = fieldValue[key].replace(new RegExp(idPair['old_document_id'], 'g'), idPair['new_document_id']);    
				}
			}
		}
		return fieldValue;
	}
	
	//. builder
	async fetchInfoForBuilder(socket, data) {
		const self = this;
		if (!await this.checkSecurity(data)) {
			this.wsManager.send(socket, 'securityError', 'error', data['organization_id']);
			return;   
		}
		
		try {
				
			var collectionList = [];
			var modules = [];
			this.db.listCollections().toArray(function(err, collInfos) {
				
				collInfos.forEach(function(colInfo) {
					collectionList.push(colInfo.name);
				})
				
				const modulesCollection = this.db.collection('modules');
				modulesCollection.find().toArray(function(error, result) {
					result.forEach(function(item) {
						modules.push({
							_id: item['_id'],
							name: item['name']
						})
					})
					
					self.wsManager.send(socket, 'fetchedInfoForBuilder', {
						collections: collectionList,
						modules: modules
					}, data['organization_id']);
				})
			});
		} catch (error) {
			console.log('fetchInfoBuilder error');
		}
	}
}

module.exports = CoCreateIndustry;