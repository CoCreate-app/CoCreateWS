const config = require('../CoCreate.config');
const {MongoClient} = require('mongodb');

module.exports.mongoClient = async function(dbUrl) {
	try {
		dbUrl = dbUrl || config.db_url;
		if (!dbUrl || !dbUrl.includes('mongodb'))
			console.log('CoCreate.config.js missing dbUrl')
		dbClient = await MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
		return dbClient;
	} catch (error) {
		console.error(error)
		return {
			status: false
		}
	}
}

