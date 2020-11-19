
const qs = require('querystring');
const WebSocket = require('ws');
const url = require("url");
const EventEmitter = require("events").EventEmitter;

class WSManager extends EventEmitter{
	constructor() {
		super();

		this.clients = new Map();
		this.prefix = "crud";
		
		//. websocket server
		this.wss = new WebSocket.Server({noServer: true});
	}
	
	handleUpgrade(req, socket, head) {
		const self = this;
		const pathname = url.parse(req.url).pathname;
		const url_info = this.getKeyFromUrl(pathname)
		if (url_info.type == this.prefix) {
			self.wss.handleUpgrade(req, socket, head, function(ws) {
				self.onWebSocket(req, ws, url_info);
			})
			return true;
		}
		return false;
	}
	
	onWebSocket(req, ws, info) {
		const self = this;
		
		this.addClient(ws, info.key);
		
		ws.on('message', (message) => {
			self.onMessage(ws, message, info);
		})
		
		ws.on('close', function () {
			console.log('closed client')
			self.removeClient(ws, info.key)
		})

		ws.on("error", () => {
			console.log('websocket errror before upgrade');
			self.removeClient(ws, info.key)
		});
		
		this.send(ws, 'connect', info.key);
		
	}
	
	removeClient(ws, key) {
		let room_clients = this.clients.get(key)
		const index = room_clients.indexOf(ws);
		console.log(index)
		if (index > -1) {
			room_clients.splice(index, 1);
		}
		
		if (room_clients.length == 0) {
			this.emit('userStatus', ws, {info: key.replace(`/${this.prefix}/`, ''), status: 'off'});
		}
	}
	
	addClient(ws, key) {
		let room_clients = this.clients.get(key);
		if (room_clients) {
			room_clients.push(ws);
		} else {
			room_clients = [ws];
		}
		this.clients.set(key, room_clients);

		this.emit('userStatus', ws, {info: key.replace(`/${this.prefix}/`, ''), status: 'on'});
	}
	
	getKeyFromUrl(pathname)	{
		var path = pathname.split("/");
		var params = {
			type: null,
			key: pathname
		}  
		if (path.length > 0) {
			params.type = path[1];
			params.orgId = path[2]
		}
		return params
	}
	
	onMessage(ws, message, roomInfo) {
		
		try {
			
			if (message instanceof Buffer) {
				this.emit('importFile2DB', ws, message, roomInfo)
				return;
			}
			
			const data = JSON.parse(message)
			
			if (data.action) {
				if (roomInfo.orgId != null) {
					this.emit('changeDB', ws, {db: roomInfo.orgId}, roomInfo);
				}
				this.emit(data.action, ws, data.data, roomInfo);
			}
			
		} catch(e) {
			console.log(e);
		}
	}
	
	broadcast(ws, namespace, room, messageType, data, isExact) {
	    let room_key = this.prefix + "/" + namespace;
	    if (room) {
	    	room_key += `/${room}`;	
	    }
	    const responseData =JSON.stringify({
			action: messageType,
			data: data
		});
		
		if (isExact) {
			const clients = this.clients.get(room_key);
			
			if (clients) {
				clients.forEach((client) => {
					if (ws != client) {
						client.send(responseData);
					}
				})
			}
			
		} else {
			this.clients.forEach((value, key) => {
				if (key.includes(room_key)) {
					value.forEach(client => {
						if (ws != client) {
							client.send(responseData);
						}
					})
				}
			})
			
		}
		
	}
	
	send(ws, messageType,  data){
		const responseData = {
			action: messageType,
			data: data
		}
		ws.send(JSON.stringify(responseData));
	}
	
	sendBinary(ws, data) {
		ws.send(data, {binary: true});
	}
}


module.exports = new WSManager()
