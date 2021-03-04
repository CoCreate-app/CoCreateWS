
const MongoClient = require('mongodb').MongoClient;
const config = require('../config.json');

const CoCreateCrud = require("./components/crud");
const CoCreateList = require("./components/list")
const CoCreateIndustry = require('./components/industry')
const CoCreateUser = require('./components/user')
const CoCreateMessage = require('./components/message')
const CoCreateOrganization = require('./components/organization')
const CoCreateSendGrid = require('./plugins/sendgrid/CoCreate-sendgrid'); 
const CoCreateDomain = require('./plugins/domain/Cocreate-domain')
const CoCreateEmail = require('./plugins/email/Cocreate-email')
const CoCreateXXX = require('./plugins/xxx/Cocreate-xxx')
const CoCreateTwilio = require('./plugins/twilio/Cocreate-twilio')
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
	new CoCreateDomain(manager, db)
	new CoCreateEmail(manager, db)
	new CoCreateXXX(manager, db)
	// new CoCreateTwilio(manager, db)
	new CoCreateOrganization(manager, db)
	new CoCreateSendGrid(manager);
	new CoCreateBackup(manager, db)
	
	new CoCreateMetrics(manager, db)
}