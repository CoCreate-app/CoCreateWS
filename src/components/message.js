
const CoCreateBase = require("../core/CoCreateBase");
const {ObjectID, Binary} = require("mongodb");

class CoCreateMessage extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('sendMessage',		(socket, data) => this.sendMessage(socket, data));
		    this.wsManager.on('openWindow',			(socket, data) => this.openWindow(socket, data))
			this.wsManager.on('windowBtnEvent', 	(socket, data) => this.windowBtnEvent(socket, data))
		}
	}

	/**
	CoCreateSocket.sendMessage({
		namespace: '',
		rooms: [r1, r2],
		emit: {
			message': 'nice game',
			data': 'let's play a game ....'
		}
	})
	**/
	async sendMessage(socket, data, roomInfo) {
		if (!await this.checkSecurity(data)) {
			this.wsManager.send(socket, 'securityError', 'error');
			return;   
		}

		try {
			const req_data = data;
			if (!req_data.emit) {
				return ;
			}
			
			const self = this;
			const emit = req_data.emit;
			
			if (data.broadcast_sender === true) {
				self.wsManager.send(socket, emit.message, emit.data);
			}

			if (data.broadcast !== false) {
				if (req_data.rooms && req_data.rooms.length > 0) {
					req_data.rooms.forEach((room) => {
						self.wsManager.broadcast(socket, req_data.namespace || data['organization_id'] , room, emit.message, emit.data, true);
					})
				} else {
					self.wsManager.broadcast(socket, req_data.namespace || data['organization_id'] , null, emit.message, emit.data);
				}
			}
			
		} catch (error) {
			console.log('sendMessage Error', error);
		}
	}
	
	async windowBtnEvent(socket, data) {
		if (!await this.checkSecurity(data)) {
			this.wsManager.send(socket, 'securityError', 'error');
    		return; 
		}
		
		try {
			this.wsManager.send(socket, 'windowBtnEvent', data.data);
			//. broadcast
			if (data.room) {
				this.wsManager.broadcast(socket, data['organization_id'] , data.room, 'windowBtnEvent', data.data, true);
			} else {
				this.wsManager.broadcast(socket, data['organization_id'], null, 'windowBtnEvent', data.data)
			}
			
		} catch (error) {
			console.log('window btn event', error);
		}
	}
	
	async openWindow(socket, data) {
		if (!await this.checkSecurity(data)) {
			this.wsManager.send(socket, 'securityError', 'error');
    		return; 
		}
		
		try {
			this.wsManager.send(socket, 'openWindow', data.data);
			//. broadcast
			if (data.room) {
				this.wsManager.broadcast(socket, data['organization_id'] , data.room, 'openWindow', data.data, true);
			} else {
				this.wsManager.broadcast(socket, data['organization_id'], null, 'openWindow', data.data)
			}
			
		} catch (error) {
			console.log('window btn event', error);
		}
	}

}
module.exports = CoCreateMessage;



