'use strict'
var utils= require('../utils');
const CoCreateBase = require("../../base");

class CoCreateXXX extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('xxx',		(socket, data, roomInfo) => this.sendXXX(socket, data, roomInfo));
		}
	}
	async sendXXX(socket, data, roomInfo) {
	    let that = this;
	    let send_response ='xxx';
        let type = data['type'];

        switch (type) {
            case 'xxxCreateRequest':
                utils.send_response(that.wsManager, socket, {"type":type,"response":data.data}, send_response)

that.wsManager.onMessage(socket, "createDocument", data, roomInfo)

that.wsManager.onMessage(socket, "readDocument", data, roomInfo)

that.wsManager.onMessage(socket, "updateDocument", data, roomInfo)
// data param:
// that.wsManager.onMessage(socket, "updateDocument", {
// 					namespace: '',
// 					room: '',
// 					broadcast: true/false,
// 					broadcast_sender: true/false,
					
// 					collection: "test123",
// 					document_id: "document_id",
// 					data:{
					
// 						name1:“hello”,
// 						name2: “hello1”
// 					},
// 					delete_fields:["name3", "name4"],
// 					element: “xxxx”,
// 					metaData: "xxxx"
// 					}, roomInfo)
					
that.wsManager.onMessage(socket, "deleteDocument", data, roomInfo)


        }
        
	}// end sendStripe
	
}//end Class 
module.exports = CoCreateXXX;
