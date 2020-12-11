const CoCreateCRUD = require("./core/CoCreate-CRUD.js")
/**
 * Socket init 
 */
 
const socket = {
    "config": {
        "apiKey": "c2b08663-06e3-440c-ef6f-13978b42883a",
    	"securityKey": "f26baf68-e3a9-45fc-effe-502e47116265",
    	"organization_Id": "5de0387b12e200ea63204d6c"
    },
    "host": "server.cocreate.app:8088"
}
CoCreateCRUD.CoCreateSocketInit(socket)


/**
 * Store data into dab
 */

  /*
  CreateDocument({
    namespace:'',
    room:'',
    broadcast: true/false, (default=ture)
    broadcast_sender: true/false, (default=true) 
    collection: "test123",
    data:{
    	name1:“hello”,
    	name2:  “hello1”
    },
    metaData: any
  }, config),
  */
  
CoCreateCRUD.CreateDocument({
	collection: "server-crud",
	broadcast_sender: true,
	broadcast: false,
	data: {
		"name": "CoCreate Server CRUD",
		"version": "0.0.1"
	},
	
}, socket.config);

// CoCreateCRUD.listen('readDocument', function(data) {
// 	console.log(data)
// });

// CoCreateCRUD.listen('updateDocument', function(data) {
// 	console.log(data)
// });

CoCreateCRUD.listen('createDocument', function(data) {
	console.log(data)
});
