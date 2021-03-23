
const {ObjectID} = require("mongodb");

class AsyncMessage {
	constructor(key) {
		this.key = key;
		this.messages = new Map();
		this.orders = [];
	}
	
	defineMessage(id) {
		this.orders.push(id);
		this.messages.set(id, null);
	}
	
	setMessage(id, data) {
		this.messages.set(id, data);
		if (this.orders.length > 0) {
			this.runMessage();
		}
		
	}
	
	runMessage() {
		let runIndex = -1;
		this.orders.some((key, index) => {
			let messageData = this.messages.get(key)
			if (messageData != null) {
				messageData.forEach(({socket, message}) => {
					try {
						if (socket) {
							socket.send(message);
						}
					} catch (error) {
						console.log(error);
					}
				})
				
				runIndex = index;
				this.messages.delete(key);
				return false;
			} else {
				return true;
			}
		})
		
		if (runIndex !== -1) {
			this.orders.splice(0, runIndex + 1);
		}
		
	}
}

module.exports = AsyncMessage;