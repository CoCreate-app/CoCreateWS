
const qs = require('querystring');
const WebSocket = require('ws');
const url = require("url");
const EventEmitter = require("events").EventEmitter;
const AsyncMessage = require("./AsyncMessage")
const { GenerateUUID } = require("./utils")

class WSManager extends EventEmitter{
	constructor(prefix) {
		super();

		this.clients = new Map();
		this.asyncMessages = new Map();
		
		this.prefix = prefix || "crud";
		
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
		
		this.addClient(ws, info.key, info);
		
		ws.on('message', (message) => {
			self.onMessage(ws, message, info);
		})
		
		ws.on('close', function () {
			self.removeClient(ws, info.key, info)
		})

		ws.on("error", () => {
			self.removeClient(ws, info.key, info)
		});
		
		this.send(ws, 'connect', info.key);
		
	}
	
	removeClient(ws, key, roomInfo) {
		let room_clients = this.clients.get(key)
		const index = room_clients.indexOf(ws);

		if (index > -1) {
			room_clients.splice(index, 1);
		}
		
		if (room_clients.length == 0) {
			this.emit('userStatus', ws, {info: key.replace(`/${this.prefix}/`, ''), status: 'off'}, roomInfo);
			this.emit("removeMetrics", null, {org_id: roomInfo.orgId});
			// this.addAsyncMessage.delete(key);
		} else {
			let total_cnt = 0;
			this.clients.forEach((c) => total_cnt += c.length)
			
			this.emit("changeCountMetrics", null, {
				org_id: roomInfo.orgId, 
				total_cnt, 
				client_cnt: room_clients.length
			});
		}
		
	}
	
	addClient(ws, key, roomInfo) {
		let room_clients = this.clients.get(key);
		if (room_clients) {
			room_clients.push(ws);
		} else {
			room_clients = [ws];
		}
		this.clients.set(key, room_clients);
		this.addAsyncMessage(roomInfo.key)
		
		this.emit('userStatus', ws, {info: key.replace(`/${this.prefix}/`, ''), status: 'on'}, roomInfo);

		//. add metrics
		let total_cnt = 0;
		this.clients.forEach((c) => total_cnt += c.length)
		
		this.emit("createMetrics", null, {
			org_id: roomInfo.orgId, 
			client_cnt: room_clients.length, 
			total_cnt: total_cnt
		});
	}
	
	addAsyncMessage(key) {
		let asyncMessage = this.asyncMessages.get(key)
		if (!asyncMessage) {
			this.asyncMessages.set(key, new AsyncMessage(key));
		}
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
			this.recordTransfer('in', message, roomInfo.orgId)

			if (message instanceof Buffer) {
				this.emit('importFile2DB', ws, message, roomInfo)
				return;
			}
			
			const data = JSON.parse(message)
			let cloneRoomInfo = {...roomInfo};
			
			if (data.action) {
				//. checking async status....				
				let { metadata } = data.data;
				if (metadata && metadata.async == true) {
					const uuid = GenerateUUID(), asyncMessage = this.asyncMessages.get(cloneRoomInfo.key);
					cloneRoomInfo.asyncId = uuid;
					if (asyncMessage) {
						asyncMessage.defineMessage(uuid);
					}
				}
				//. End
				
				if (cloneRoomInfo.orgId != null) {
					this.emit('changeDB', ws, {db: cloneRoomInfo.orgId}, cloneRoomInfo);
				}
				this.emit(data.action, ws, data.data, cloneRoomInfo);
			}
			
		} catch(e) {
			console.log(e);
		}
	}
	
	broadcast(ws, namespace, room, messageType, data, isExact, roomInfo) {
		const self = this;
		const asyncId = this.getAsyncId(roomInfo)
	    let room_key = this.prefix + "/" + namespace;
	    if (room) {
	    	room_key += `/${room}`;	
	    }
	    const responseData =JSON.stringify({
			action: messageType,
			data: data
		});
		
		let isAsync = false;
		let asyncData = [];
		if (asyncId && roomInfo && roomInfo.key) {
			isAsync = true;	
		}
		
		if (isExact) {
			const clients = this.clients.get(room_key);
			
			if (clients) {
				clients.forEach((client) => {
					if (ws != client) {
						if (isAsync) {
							asyncData.push({socket: client, message: responseData})
						} else {
							client.send(responseData);
						}
						self.recordTransfer('out', responseData, namespace)
					}
				})
			}
			
		} else {
			this.clients.forEach((value, key) => {
				if (key.includes(room_key)) {
					value.forEach(client => {
						if (ws != client) {
							if (isAsync) {
								asyncData.push({socket: client, message: responseData})
							} else {
								client.send(responseData);
							}
							self.recordTransfer('out', responseData, namespace)
						}
					})
				}
			})
		}
		
		//. set async processing
		if (isAsync) {
			this.asyncMessages.get(roomInfo.key).setMessage(asyncId, asyncData)
		}
		
	}
	
	send(ws, messageType,  data, orgId, roomInfo){
		const asyncId = this.getAsyncId(roomInfo)
		let responseData = JSON.stringify({
			action: messageType,
			data: data
		});

		if (asyncId && roomInfo && roomInfo.key) {
			console.log(asyncId, roomInfo.key)
			this.asyncMessages.get(roomInfo.key).setMessage(asyncId, [{socket: ws, message: responseData}]);
		} else {
			ws.send(responseData);
		}
		this.recordTransfer('out', responseData, orgId)

	}
	
	getAsyncId(roomInfo) {
		if (!roomInfo) return null;
		
		if (roomInfo.asyncId) {
			return roomInfo.asyncId;
		}
		return null
	}
	
	sendBinary(ws, data, orgId) {
		ws.send(data, {binary: true});
		this.recordTransfer('out', data, orgId)
	}
	
	recordTransfer(type, data, org_id) {
		this.emit("setBandwidth", null, {
			type, 
			data, 
			org_id
		});
		
		// let date = new Date();
		// let size = 0;
		
		// type = type || 'in'
		
		// if (data instanceof Buffer) {
		// 	size = data.byteLength;
		// } else if (data instanceof String || typeof data === 'string') {
		// 	size = Buffer.byteLength(data, 'utf8');
		// }
		
		// if (size > 0 && orgId) {
		// 	console.log (`${orgId}  ----  ${type} \t ${date.toISOString()} \t ${size}`);
		// }
	}
}


module.exports = WSManager
