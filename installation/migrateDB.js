const { MongoClient } = require("mongodb");

const fromDB = 'dbUrl';
const fromDBName = '652c8d62679eca03e0b116a7'

const toDB = 'dbUrl';
const toDBName = 'dev'

const array = ["organizations", "users", "keys"];
// const exclude = ["organizations", "users", "keys", "files", "crdt", "metrics", "industries", "industry_objects"];


async function migrateDb() {
    try {
        const newDb = await MongoClient.connect(toDB, { useNewUrlParser: true, useUnifiedTopology: true });
        const newDatabase = newDb.db(toDBName);

        const previousDb = await MongoClient.connect(fromDB, { useNewUrlParser: true, useUnifiedTopology: true });
        const previousDatabase = previousDb.db(fromDBName);

        previousDatabase.listCollections().toArray(function (error, results) {
            if (!error && results && results.length > 0) {
                for (let result of results) {
                    // if (array.includes(result.name))
                    migrate(previousDatabase, newDatabase, result.name)
                }
            }
        })

    } catch (err) {
        console.error("An error occurred:", err);
    }
}

function migrate(previousDatabase, newDatabase, arrayName) {
    try {
        const previousArray = previousDatabase.collection(arrayName);
        const newArray = newDatabase.collection(arrayName); // Moved outside of the forEach
        const cursor = previousArray.find();

        let batch = [];
        let batchSize = 0; // Keep track of the batch size in memory
        const maxBatchSize = 16000000; // Adjust based on MongoDB's BSON Document Size limit (16MB)
        const maxCount = 1000; // Maximum count of documents

        cursor.forEach(
            function (doc) {
                if (doc) {
                    let docSize = JSON.stringify(doc).length; // Approximation of document size
                    if (batchSize + docSize < maxBatchSize && batch.length < maxCount) {
                        batch.push(doc);
                        batchSize += docSize;
                    } else {
                        // Batch is full, insert it
                        newArray.insertMany(batch);
                        batch = [doc]; // Start a new batch with the current document
                        batchSize = docSize; // Reset batch size to current document's size
                    }
                }
            },
            function (err) {
                if (err) {
                    console.log('Cursor processing error:', err);
                } else {
                    // Insert any remaining documents in the batch
                    if (batch.length > 0) {
                        newArray.insertMany(batch);
                    }
                    console.log('Migration completed successfully');
                }
            }
        );

    } catch (error) {
        console.log('Migration error', error);
    }
}

migrateDb();
