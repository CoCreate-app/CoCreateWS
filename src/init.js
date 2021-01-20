
const MongoClient = require('mongodb').MongoClient;
const config = require('../config.json');

const CoCreateCrud = require("./components/crud");
const CoCreateList = require("./components/list")
const CoCreateIndustry = require('./components/industry')
const CoCreateUser = require('./components/user')
const CoCreateMessage = require('./components/message')
const CoCreateOrganization = require('./components/organization')

const CoCreateDomain = require('./apis/domain/Cocreate-domain')
const CoCreateStripe = require('./apis/stripe/Cocreate-stripe')
const CoCreateEmail = require('./apis/email/Cocreate-email')
const CoCreateXXX = require('./apis/xxx/Cocreate-xxx')
const CoCreateTwilio = require('./apis/twilio/Cocreate-twilio')

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
	new CoCreateStripe(manager, db)
	new CoCreateEmail(manager, db)
	new CoCreateXXX(manager, db)
	new CoCreateTwilio(manager, db)
	new CoCreateOrganization(manager, db)

	new CoCreateBackup(manager, db)
}