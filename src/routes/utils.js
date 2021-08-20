var ObjectID = require('mongodb').ObjectID;

const select_db = (client, db_name) => {
  if (client) {
    return client.db(db_name)
  }
}

module.exports = {
  getDocument: async (client, data, dbName) => {
    
    try {
        const db = select_db(client, dbName); // obtenemos la conexión      
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
  getDocumentByQuery: async (client, data,dbName) => {
    
    try {
        const db = select_db(client, dbName); // obtenemos la conexión      
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
  organizationsfindOne : async (client, data, dbName) => {
    try {
      const db = select_db(client, dbName); // obtenemos la conexión      
      const collection = db.collection('organizations');
      var query ={ "domains": { $in: [data["domains"]] } };
      return await collection.findOne(query);
     }catch(e){
      console.log(" Catch Error OrganizationfinOne ---",e)
      return null;
    } 
  },
  
  routesfindOne : async (client, data,dbName) => {
    try {
      const db = select_db(client, dbName); // obtenemos la conexión 
      const collection = db.collection('files');
      return await collection.findOne({domains: { $in: [data["hostname"]] }  , "path" : data["route_uri"]});
      // return await collection.findOne( { $or: [{domains: { $in: [data["hostname"]] }, route : data["route_uri"]}, {domains: { $in: [data["hostname"]]}, route : data["route_uri"]} ] });
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
