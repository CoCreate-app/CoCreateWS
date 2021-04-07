const { MongoClient } = require('mongodb');
var config = require('../../config.json');

// Nombre de bd
//const dbName = 'mydb';
//const mongo_uri = config.db_url;// 'mongodb://localhost:27017';
const mongo_uri = config.db_url;// 'mongodb://localhost:27017';
console.log("mongo_uri => ",mongo_uri)
const client = new MongoClient(mongo_uri, { useNewUrlParser: true, poolSize: 10 });

module.exports = async (mydbName) => {
  const dbName = (mydbName) ? mydbName : 'mydb' ;
  await client.connect();
  console.log(" Conection to  " + dbName, ' mongo_uri ',mongo_uri)
  return client.db(dbName); // retornamos la conexión con el nombre de la bd a usar
};