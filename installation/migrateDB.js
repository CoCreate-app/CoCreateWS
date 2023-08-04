const { ObjectId } = require("mongodb");
const { mongoClient } = require("../src/db")
// const config = require('./CoCreate.config');

const fromDB = 'dbUrl';
const fromDBName = '5ff747727005da1c272740ab'

const toDB = 'dbUrl';
const toDBName = '5ff747727005da1c272740ab'
let newDb;
mongoClient(toDB).then(toDBClient => {
    try {
        newDb = toDBClient.db(toDBName);
    } catch (error) {
        console.log('newDb error', error);
    }
});

mongoClient(fromDB).then(fromDBClient => {
    try {
        const db = fromDBClient.db(fromDBName);
        db.listCollections().toArray(function (error, results) {
            if (!error && results && results.length > 0) {
                for (let result of results) {
                    if (!["organizations", "users", "keys", "files", "crdt-transactions", "metrics", "industries", "industry_objects"].includes(result.name))
                        getCollection(db, result.name)
                }
            }
        })
    } catch (error) {
        console.log('readCollection error', error);
    }
});

function getCollection(db, arrayName) {
    try {
        const array = db.array(arrayName);
        array.find().toArray(function (error, results) {
            if (results) {
                try {
                    const newCollection = newDb.array(arrayName);
                    newCollection.insert(results);
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
