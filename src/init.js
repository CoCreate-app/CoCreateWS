
const MongoClient = require('mongodb').MongoClient;
const config = require('../config.json');

const CoCreateCrud = require("./components/crud");
const CoCreateList = require("./components/list")
const CoCreateIndustry = require('./components/industry')
const CoCreateUser = require('./components/user')
const CoCreateMessage = require('./components/message')
const CoCreateOrganization = require('./components/organization')
const CoCreateMetrics = require('./components/metrics')
const CoCreateBackup = require("./components/backup")


module.exports.WSManager = function(manager) {
	MongoClient
		.connect(config.db_url, { useNewUrlParser: true, poolSize: 10 })
		.then(client => {
			initDBManagers(manager, client);
		})
		.catch(error => console.error(error));
}

function initDBManagers(manager, db){
	new CoCreateCrud(manager, db)
	new CoCreateList(manager, db)
	new CoCreateIndustry(manager, db)
	new CoCreateUser(manager, db)
	new CoCreateMessage(manager, db)
	new CoCreateOrganization(manager, db)
	new CoCreateBackup(manager, db)
	new CoCreateMetrics(manager, db)
}