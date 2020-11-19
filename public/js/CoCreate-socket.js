var CoCreateSocket = {
	sockets : new Map(),
	prefix  : "crud",
	listeners: new Map(),
	
	globalScope: "",

	setGlobalScope: function(scope) {
		this.globalScope = `${this.prefix}/${scope}`;
	},
	getGlobalScope: function() {
		return this.globalScope;
	},
	
	/**
	 * config: {namespace, room}
	 */
	create: function(config) {
		const {namespace, room} = config;
		const key = this.getKey(namespace, room);
		let _this = this;
		let socket;
		if (this.sockets.get(key)) {
			socket = this.sockets.get(key);
			console.log('SOcket already has been register');
			return;
		}
		
		socket = new WebSocket(`ws://${location.host}/${key}`);
		
		socket.onopen = function(event) {
			console.log('created socket: ' + key);
			_this.sockets.set(key, socket);
		}
		
		socket.onclose = function(event) {
			switch(event.code) {
				case 1000: // close normal
					console.log("websocket: closed");
					break;
				default: 
					_this.destroy(socket, key);
					_this.reconnect(socket, config);
					break;
			}
		}
		
		socket.onerror = function(err) {
			console.log('Socket error');
			_this.destroy(socket, key);
			_this.reconnect(socket, config);
		}
		

		socket.onmessage = function(data) {
			
			try {
				let rev_data = JSON.parse(data.data);
				const listeners = _this.listeners.get(rev_data.action);
				if (!listeners) {
					return;
				}
				listeners.forEach(listener => {
					listener(rev_data.data, key);
				})
			} catch (e) {
				console.log(e);
			}
		}
	},
	
	/**
	 * 
	 */
	send: function(action, data, room) {
		const obj = {
			action: action,
			data: data
		}
		
		const socket = this.getByRoom(room);
		
		if (socket) {
			socket.send(JSON.stringify(obj));
		}
	},

	/**
	 * scope: ns/room
	 */
	listen: function(type, callback) {
		if (!this.listeners.get(type)) {
			this.listeners.set(type, [callback]);
		} else {
			this.listeners.get(type).push(callback);
		}
	},
	
	reconnect: function(socket, config) {
		let _this = this;
		setTimeout(function() {
			console.log('socket: reconnecting....');
			_this.create(config);
		}, 1000)
	},
	
	destroy: function(socket, key) {
		if (socket) {
			socket.onerror = socket.onopen = socket.onclose = null;
			socket.close();
			socket = null;
		}
		
		if (this.sockets.get(key)) {
			this.sockets.delete(key);
		}
	},
	
	getKey: function(namespace, room) {
		let key = `${this.prefix}`;
		if (namespace && namespace != '') {
			if (room &&  room != '') {
				key += `/${namespace}/${room}`;
			} else {
				key +=`/${namespace}`;
			}
		}
		return key;
	},
	
	getByRoom: function(room) {
		let key = this.globalScope;
		if (room) {
			key = `${this.prefix}/${room}`;
		}
		return this.sockets.get(key);	
	},
	
	// getNSListeners: function(ns, data) {
	// 	let prefixKey = this.prefix + "/" + ns + "/";
		
	// 	while(!this.listeners.next().done) {
	// 		const [key, value] = this.listeners.next().value;
	// 		if (key.includes(prefixKey)) {
	// 			value.forEach(l => {
	// 				l(data);
	// 			})
	// 		}
	// 	}
	// }
}
