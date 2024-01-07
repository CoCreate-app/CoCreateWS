const { MongoClient } = require("mongodb");

const fromDB = 'mongodb+srv://cocreate-app:0kqEaoEzDUM9lGTP@cocreatedatabase.ne3tel6.mongodb.net/?retryWrites=true&w=majority';
const fromDBName = '5ff747727005da1c272740ab'

const toDB = 'mongodb+srv://cocreate-app:0kqEaoEzDUM9lGTP@cocreatedatabase.ne3tel6.mongodb.net/?retryWrites=true&w=majority';
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
                    if (array.includes(result.name))
                        getCollection(previousDatabase, newDatabase, result.name)
                }
            }
        })

    } catch (err) {
        console.error("An error occurred:", err);
    }
}

function getCollection(previousDatabase, newDatabase, arrayName) {
    try {
        const previousArray = previousDatabase.collection(arrayName);
        previousArray.find().toArray(function (error, results) {
            if (results) {
                try {
                    const newCollection = newDatabase.collection(arrayName);
                    newCollection.insertMany(results);
                } catch (error) {
                    console.log('arrays error', error);
                }
            } else {
                console.log(error)
            }
        })
    } catch (error) {
        console.log('arrayList error', error);
    }
}

migrateDb();
