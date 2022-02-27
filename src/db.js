const config = require('../CoCreate.config');
const {MongoClient} = require('mongodb');

module.exports.mongoClient = async function(dbUrl) {
	try {
		if (!dbUrl)
			dbUrl = config.db_url
		dbClient = await MongoClient.connect(dbUrl, { useNewUrlParser: true, poolSize: 10, useUnifiedTopology: true });
		return dbClient;
	} catch (error) {
		console.error(error)
		return {
			status: false
		}
	}
}

