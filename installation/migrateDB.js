const { MongoClient } = require("mongodb");

const fromDB = "";
const fromDBName = "test";

const toDB = "";
const toDBName = "652c8d62679eca03e0b116a7";

const array = ["careers"];
// const array = ["organizations", "users", "keys"];
// const exclude = ["organizations", "users", "keys", "files", "crdt", "metrics", "industries", "industry_objects"];

const UPSERT_ENABLED = true; // Set to false if you don't want to upsert
const OVERWRITE_ENTIRE_DOCUMENT = false; // Set to false to use $set and merge fields

async function migrateDb() {
	try {
		const newDb = await MongoClient.connect(toDB, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		const newDatabase = newDb.db(toDBName);

		const previousDb = await MongoClient.connect(fromDB, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		const previousDatabase = previousDb.db(fromDBName);

		previousDatabase.listCollections().toArray(function (error, results) {
			if (!error && results && results.length > 0) {
				for (let result of results) {
					if (!array || (array && array.includes(result.name)))
						migrate(previousDatabase, newDatabase, result.name);
				}
			}
		});
	} catch (err) {
		console.error("An error occurred:", err);
	}
}

function migrate(previousDatabase, newDatabase, arrayName) {
	try {
		const previousArray = previousDatabase.collection(arrayName);
		const newArray = newDatabase.collection(arrayName);
		const cursor = previousArray.find();

		let operations = [];
		let batchSize = 0;
		const maxBatchSize = 16000000; // 16MB
		const maxCount = 1000;

		cursor.forEach(
			function (doc) {
				if (doc) {
					let docSize = JSON.stringify(doc).length;
					if (
						batchSize + docSize < maxBatchSize &&
						operations.length < maxCount
					) {
						let operation;
						if (OVERWRITE_ENTIRE_DOCUMENT) {
							operation = {
								replaceOne: {
									filter: { _id: doc._id },
									replacement: doc,
									upsert: UPSERT_ENABLED
								}
							};
						} else {
							operation = {
								updateOne: {
									filter: { _id: doc._id },
									update: { $set: doc },
									upsert: UPSERT_ENABLED
								}
							};
						}
						operations.push(operation);
						batchSize += docSize;
					} else {
						newArray.bulkWrite(operations);
						operations = [];
						batchSize = 0;
					}
				}
			},
			function (err) {
				if (err) {
					console.log("Cursor processing error:", err);
				} else {
					if (operations.length > 0) {
						newArray.bulkWrite(operations);
					}
					console.log(
						`Migration of collection '${arrayName}' completed successfully`
					);
				}
			}
		);
	} catch (error) {
		console.log("Migration error", error);
	}
}

migrateDb();
