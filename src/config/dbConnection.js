const { MongoClient } = require('mongodb');
var config = require('../../config.json');

// Nombre de bd
const dbName = 'mydb';
const mongo_uri = config.db_url;// 'mongodb://localhost:27017';
console.log("mongo_uri => ",mongo_uri)
const client = new MongoClient(mongo_uri, { useNewUrlParser: true, poolSize: 10 });

module.exports = async () => {
  await client.connect();

  return client.db(dbName); // retornamos la conexión con el nombre de la bd a usar
};