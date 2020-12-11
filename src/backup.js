
const CoCreateBase = require("./base");
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
			this.wsManager.on('exportDB',		(socket, data) => this.exportData(socket, data));
			this.wsManager.on('importDB',		(socket, data) => this.setImportData(socket, data));
			this.wsManager.on('importFile2DB',	(socket, data) => this.importData(socket, data));
			
			this.wsManager.on('downloadData',	(socket, data) => this.downloadData(socket, data))
		}
	}
	
	/**
	 * data: {
	 	collection: '',
	 	type: 'csv/json'
	 	data: JSON data
	 }
	**/
	async downloadData(socket, data) {
		const export_type = data.type || "json";
		
		try {
			let binaryData = null;
			const result = data.data;
			
			if (export_type === 'csv') {
				binaryData = await json2csv.json2csvAsync(JSON.parse(JSON.stringify(result)), {
					emptyFieldValue: ''
				});
			} else {
				binaryData = Buffer.from(JSON.stringify(result));
			}
			
			this.wsManager.send(socket, 'downloadFileInfo', {file_name: `backup_${data['collection']}.${export_type}`});

			this.wsManager.sendBinary(socket, binaryData);

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
			
			const collection = this.getCollection(data)
			
			var query = {};
			if (securityRes['organization_id']) {
				query['organization_id'] = securityRes['organization_id'];
			}
			
			collection.find(query).toArray(async function(error, result) {
				if (!error) {
					let binaryData = null;
					self.wsManager.send(socket, 'downloadFileInfo', {file_name: `backup_${data['collection']}.${export_type}`});
					if (export_type === 'csv') {
						binaryData = await json2csv.json2csvAsync(JSON.parse(JSON.stringify(result)), {
							emptyFieldValue: ''
						});
					} else {
						binaryData = Buffer.from(JSON.stringify(result));
					}

					self.wsManager.sendBinary(socket, binaryData);
				}
			});
		} catch (error) {
			console.log('export error', error); 
		}
	}
	
	async setImportData(socket, data) {
		const securityRes = await this.checkSecurity(data);
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error');
			return;   
		}
		this.importCollection = data['collection']
		this.importType = data['import_type'];
		this.importDB = data['namespace'];
	}

	async importData(socket, data) {
		const self = this;
		
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

			const collection = this.getDB(this.importDB).collection(this.importCollection);
			
			collection.insertMany(jsonData, function(err, result) {
				if (!err) {
					self.wsManager.send(socket, 'importedFile2DB', {
						'collection': self.importCollection,
						'database': self.importDB,
						'import_type': self.importType,
						'data': result
					})
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



