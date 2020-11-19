const connection = require('../config/dbConnection.js');
var ObjectID = require('mongodb').ObjectID;
module.exports = {
  getDocument: async (data) => {
    
    try {
        const db = await connection(); // obtenemos la conexión      
        //console.log(" Beginf Query")
    
        const collection = db.collection(data["collection"]);
    
        var query = {
          "_id": new ObjectID(data["document_id"])
        };
        
        return await collection.findOne(query);
        //console.log(" END Query")
        
    } finally {
      //client.close();
      //console.log(" finlllay ")
    }
  }
}
