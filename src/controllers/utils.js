const connection = require('../config/dbConnection.js');
var ObjectID = require('mongodb').ObjectID;
module.exports = {
  getDocument: async (data,dbName) => {
    
    try {
        const db = await connection(dbName); // obtenemos la conexión      
        //console.log(" Beginf Query")
    
        const collection = db.collection(data["collection"]);
    
        var query = {
          "_id": new ObjectID(data["document_id"])
        };
        
        return await collection.findOne(query);
        //console.log(" END Query")
        
    }
    catch(e){
      console.log(" Catch Error finOne ---",e)
      return null;
    }
    /*finally {
      //client.close();
      //console.log(" finlllay ")
    }*/
  },
  getDocumentByQuery: async (data,dbName) => {
    
    try {
        const db = await connection(dbName); // obtenemos la conexión      
        const collection = db.collection(data["collection"]);
        delete data["collection"];
        var query = {
          ...data
        };
        return await collection.findOne(query);
    }
    catch(e){
      console.log(" Catch Error finOne --- By Query",e)
      return null;
    }
  },
  organizationsfindOne : async (data,dbName) => {
    try {
      const db = await connection(dbName); // obtenemos la conexión      
      const collection = db.collection('organizations');
      var query = {
          "domains": data["domain"]
        };
        
      return await collection.findOne(query);
     }catch(e){
      console.log(" Catch Error OrganizationfinOne ---",e)
      return null;
    } 
  },
  routesfindOne : async (data,dbName) => {
    try {
      const db = await connection(dbName); // obtenemos la conexión      
      
      /*console.log(" before")
      db.listCollections().toArray(function (err, collectionInfos) {
        
        console.log(collectionInfos);
        
    });*/
    
    
  
/*    var myobj = { domains: ["server.cocreate.app","cocreate.app"], route: '/test/twiml', collection: "module_activities", document_id: '5ee3937ce3fc3a5b7493dc37' ,name : 'xml',content_type : 'text/xml'};
  db.collection("routes").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 document inserted");

  });
  */
    
    
      //console.log("-- Await ",await db.getCollectionNames())
      const collection = db.collection('routes');
      //console.log(" collection ",collection)
      // db.routes.findOne({domains: { $in: [hostname] }  , route : route_uri});
      console.log("REturn ---")
      return await collection.findOne({domains: { $in: [data["hostname"]] }  , route : data["route_uri"]});
      //return await collection.findOne({domains: { $in: [data["hostname"]] }  , route : data["route_uri"]});
    }catch(e){
      console.log(" Catch Error ---",e)
      return null;
    }
    /*finally {
      console.log("Error FindOne")
     return null;
    }*/
  }
}
