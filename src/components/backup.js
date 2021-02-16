
const CoCreateBase = require("../core/CoCreateBase");
const {ObjectID, Binary} = require("mongodb");

const json2csv = require("json-2-csv")
const csvtojson = require("csvtojson");

class CoCreateBackup extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
		
		this.importCollection = '';
		this.importType = '';
		this.importDB = '';
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('exportDB',		(socket, data, roomInfo) => this.exportData(socket, data, roomInfo));
			this.wsManager.on('importDB',		(socket, data, roomInfo) => this.setImportData(socket, data, roomInfo));
			this.wsManager.on('importFile2DB',	(socket, data, roomInfo) => this.importData(socket, data, roomInfo));
			
			this.wsManager.on('downloadData',	(socket, data, roomInfo) => this.downloadData(socket, data, roomInfo))
		}
	}
	
	/**
	 * data: {
	 	collection: '',
	 	type: 'csv/json'
	 	data: JSON data
	 }
	**/
	async downloadData(socket, data, roomInfo) {
		const export_type = data.type || "json";
		
		try {
			let binaryData = null;
			const result = data.data;
			const orgId = roomInfo ? roomInfo.orgId : "";
			if (export_type === 'csv') {
				binaryData = await json2csv.json2csvAsync(JSON.parse(JSON.stringify(result)), {
					emptyFieldValue: ''
				});
			} else {
				binaryData = Buffer.from(JSON.stringify(result));
			}
			
			this.wsManager.send(socket, 'downloadFileInfo', {file_name: `backup_${data['collection']}.${export_type}`}, orgId);

			this.wsManager.sendBinary(socket, binaryData, orgId);

		} catch (error) {
			console.log('export error', error); 
		}
	}

	/**
	CoCreateSocket.exportCollection({
		collection: '',
		db: '',
		export_type: json/csv,
		
	})
	**/
	async exportData(socket, data, roomInfo) {
		const securityRes = await this.checkSecurity(data);
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error');
			return;   
		}
		const self = this;
		
		const export_type = data.export_type || "json";

		try {
			
			var collection = this.getDb(data['namespace']).collection(data["collection"]);
			const orgId = roomInfo ? roomInfo.orgId : "";
			
			var query = {};
			if (securityRes['organization_id']) {
				query['organization_id'] = securityRes['organization_id'];
			}
			
			collection.find(query).toArray(async function(error, result) {
				if (!error) {
					let binaryData = null;
					self.wsManager.send(socket, 'downloadFileInfo', {file_name: `backup_${data['collection']}.${export_type}`}, orgId);
					if (export_type === 'csv') {
						binaryData = await json2csv.json2csvAsync(JSON.parse(JSON.stringify(result)), {
							emptyFieldValue: ''
						});
					} else {
						binaryData = Buffer.from(JSON.stringify(result));
					}

					self.wsManager.sendBinary(socket, binaryData, orgId);
				}
			});
		} catch (error) {
			console.log('export error', error); 
		}
	}
	
	async setImportData(socket, data, roomInfo) {
		const securityRes = await this.checkSecurity(data);
		const orgId = roomInfo ? roomInfo.orgId : "";
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error', orgId);
			return;   
		}
		this.importCollection = data['collection']
		this.importType = data['import_type'];
		this.importDB = data['namespace'];
	}

	async importData(socket, data, roomInfo) {
		const self = this;
		const orgId = roomInfo ? roomInfo.orgId : "";
		if (!this.importCollection || !this.importType) {
			return;
		}
		
		try {
			// console.log(data.toString())
			// return;
			let jsonData = null;
			if (this.importType === 'csv') {
				jsonData = await csvtojson({ignoreEmpty: true}).fromString(data.toString())
			} else {
				jsonData = JSON.parse(data.toString());	
			}
			
			jsonData.map((item) => delete item._id);

			var collection = this.getDb(this.importDB).collection(this.importCollection);
			
			collection.insertMany(jsonData, function(err, result) {
				if (!err) {
					self.wsManager.send(socket, 'importedFile2DB', {
						'collection': self.importCollection,
						'database': self.importDB,
						'import_type': self.importType,
						'data': result
					}, orgId)
				}
			})
			
			this.importCollection = '';
			this.importType = '';
			
		} catch (error) {
			console.log('import db error', error)
		}
		
	}
	
}
module.exports = CoCreateBackup;



