
const CoCreateBase = require("../core/CoCreateBase");
const {ObjectID, Binary} = require("mongodb");

class CoCreateList extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init()
	}
	
	init() {
		this.wsManager.on('readDocumentList', (socket, data, roomInfo) => this.readDocumentList(socket, data));
		this.wsManager.on('readCollectionList', (socket, data, roomInfo) => this.readCollectionList(socket, data));
	
	}
	
	/**
	 * By jin
	 * 
		data: {
			collection: "modules",
			element: "xxxx",
			metadata: "",
			operator: {
				fetch: {
					name: 'xxxx',
					value: 'xxxxx'
				},
				filters: [{
					name: 'field1',
					operator: "$contain | $range | $eq | $ne | $lt | $lte | $gt | $gte | $in | $nin | $geoWithin",
					value: [v1, v2, ...]
				}, {
					....
				}],
				orders: [{
					name: 'field-x',
					type: 1 | -1
				}],
				search: {
					type: 'or | and',
					value: [value1, value2]
				},
				
				startIndex: 0 (integer),
				count: 0 (integer)
			},
			
			is_collection: true | false,
			//. case fetch document case
			created_ids : [id1, id2, ...],
			export: true | false
			-------- additional response data -----------
			data: [] // array
	 }
	 **/
	async readDocumentList(socket, data) {
		const securityRes = await this.checkSecurity(data);
		const self = this;
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error');
			return;   
		}
		
		if (data['is_collection']) {
			var result = await this.readCollectionList(socket, data);
			return;
		}
		
		try {
			var collection = this.db.collection(data['collection']);
			const operator = data.operator;
			
			var query = {};
			query = this.readQuery(operator);

			// if (operator['fetch'] && operator.fetch.name) {
			// 	let fetch_value = operator.fetch.value;
			// 	if (operator.fetch.name === "_id") {
			// 		fetch_value = new ObjectID(fetch_value)
			// 	}
			// 	query[operator.fetch.name] = fetch_value;
			// }
			
			if (securityRes['organization_id']) {
				query['organization_id'] = securityRes['organization_id'];
			}
			
			var sort = {};
			operator.orders.forEach((order) => {
				sort[order.name] = order.type
			});
			collection.find(query).sort(sort).toArray(function(error, result) {
				if (result) {
					if (operator['search']['type'] == 'and') {
						result = self.readAndSearch(result, operator['search']['value']);
					} else {
						result = self.readOrSearch(result, operator['search']['value']);
					}
					
					const total = result.length;
					const startIndex = operator.startIndex;
					const count = operator.count;
					let result_data = [];
					
					//. export process
					if (data.export) {
						const exportData = data.export;
						self.wsManager.emit('downloadData', socket, {...exportData, data: result})
						return;
					}
					
					if (data.created_ids && data.created_ids.length > 0) {
						let _nn = (count) ? startIndex : result.length;
						
						for (let ii = 0; ii < _nn; ii++) {
							
							const selected_item = result[ii];
							data.created_ids.forEach((fetch_id, index) => {
								if (fetch_id == selected_item['_id']) {
									result_data.push({ item: selected_item, position: ii })
								}
							})
						}
					} else {
						
						if (startIndex) result = result.slice(startIndex, total);
						
						if (count) result = result.slice(0, count)
						
						result_data = result;
					}
					
					self.wsManager.send(socket, 'readDocumentList', {
						'collection': data['collection'],
						'element': data['element'],
						'data': result_data,
						'operator': {...operator, total: total},
						'metadata': data['metadata'],
						'created_ids': data['created_ids'],
						'is_collection': data['is_collection']
					});
				}
				
				//console.log(error);
				
			})
		} catch (error) {
			console.log('readDocumentList error', error);
		}
	}
	
	async readCollectionList(socket, data) {
		const securityRes = await this.checkSecurity(data);
		if (!securityRes.result) {
			this.wsManager.send(socket, 'securityError', 'error');
			return;   
		}
		try {
			var result_collections = [];
			result_collections = await this.db.listCollections().toArray().then(infos => {
				var result = [];
				infos.forEach(function(item) {
					let __uuid = item.info.uuid.toString('hex')
					result.push({
						name: item.name,
						_id: __uuid,
						id: __uuid,
					});
				})
				return result;
			})
			
			this.wsManager.send(socket, 'readCollectionList', {
				'collection': data['collection'],
				'element': data['element'],
				'data': result_collections,
				'operator': data.opreator,
				'is_collection': data.is_collection,
				'metadata': data.metadata
			});
		} catch(error) {
			
		}
	}
	
	/**
	 * fetch document by ids
	 */
	
	// async function fetchDocumentList(socket, data) {
	//   var securityRes = await checkSecurity(data);
	//   if (!securityRes.result) {
	//     socket.emit('securityError', 'error');
	//     return;   
	//   }
		
	//   try {
			
	//     var collection = db.collection(data['data-collection']);
	//     var query = {};
	//     query = readQuery(data);
			
	//     if (data['fetch'] && data.fetch.name) {
	//       query[data.fetch.name] = data.fetch.value;
	//     }
			
	//     if (securityRes['organization_id']) {
	//       query['organization_id'] = securityRes['organization_id'];
	//     }
			
	//     var sort = {};
	//     data.orders.forEach((order) => {
	//       sort[order.name] = order.type
	//     });
	
	//     collection.find(query).sort(sort).toArray(function(error, result) {
	//       if (result) {
	//         if (data['search']['type'] == 'and') {
	//           result = readAndSearch(result, data['search']['value']);
	//         } else {
	//           result = readOrSearch(result, data['search']['value']);
	//         }
	
	//         var total = result.length;
	//         var f_ids = data['fetch_ids'];
					
	//         var _nn = result.length;
	//         if (data['count']) {
	//           _nn = data['startIndex'];
	//         }
	//         console.log(f_ids);
	//         var ret_data = [];
	//         for (let ii = 0; ii < _nn; ii++) {
						
	//           for (let j = 0; j < f_ids.length; j++) {
							
	//             console.log(f_ids[j], result[ii]['_id']);
	//             if (f_ids[j] == result[ii]['_id']) {
								
	//               ret_data.push({item: result[ii], position: ii});
								
	//             }
	//           }
	//         }
					
	//         console.log(ret_data);
				
	//         socket.emit('fetchDocumentList', {
	//           'data-collection': data['data-collection'],
	//           'eId': data['eId'],
	//           'result': ret_data,
	//           'startIndex': data['startIndex'],
	//           'per_count': data['count'],
	//           'total': total,
	//           'options': data['options']
	//         })
	//       }
				
	//       //console.log(error);
	//     })
	//   } catch (error) {
			
	//   }
		
	// }
	
	/**
	 * function that make query from data
	 * 
	 */
	readQuery(data) {
		var query = new Object();
	
		var filters = data['filters'];
		
		filters.forEach((item) => {
			if (!item.name) {
				return;
			}
			var key = item.name;
			if (!query[key]) {
				query[key] = {};
			}
			
			if (item.name == "_id") item.value = item.value.map(v => new ObjectID(v))
			
			switch (item.operator) {
				case '$contain':
					var in_values = [];
					item.value.forEach(function(v) {
						in_values.push(new RegExp(".*" + v + ".*", "i"));
					});
					
					query[key] = {$in : in_values }
					break;
					
				case '$range':
					if (item.value[0] !== null && item.value[1] !== null) {
						query[key] = {$gte: item.value[0], $lte: item.value[1]};
					} else if (item.value[0] !== null) {
						query[key] = {$gte: item.value[0]};
					} else if (item.value[1] !== null) {
						query[key] = {$lte: item.value[1]};
					}
					break;
					
				case '$eq':
				case '$ne':
				case '$lt':
				case '$lte':
				case '$gt':
				case '$gte':
					query[key][item.operator] = item.value[0];
					break;
				case '$in':
				case '$nin':
					query[key][item.operator] = item.value;
					break;
				case '$geoWithin':
					try {
						let value = JSON.parse(item.value);
						if (item.type) {
							query[key]['$geoWithin'] = {
								[item.type]: value
							} 
						}
					} catch(e) {
						console.log('geowithin error');
					}
					break;
			}    
		})
	
		//. global search
		//. we have to set indexes in text fields ex: db.chart.createIndex({ "$**": "text" })
		// if (data['searchKey']) {
		//   query["$text"] = {$search: "\"Ni\""};
		// }
		return query;
	}
	
	
	//. or operator
	readOrSearch(results, search) {
		var tmp
		if (search && search.length > 0) {
	
			tmp = results.filter(function(item) {
				
				for (var key in item) {
					var value = item[key];
					var __status = false;
					
					var str_value = value;
					
					if (Array.isArray(str_value) || typeof str_value == 'number') {
						str_value = str_value.toString();
					}
					
					if (typeof str_value == 'string') {
						str_value = str_value.toUpperCase();
					}
	
					for (let i = 0; i < search.length; i++) {
						if (typeof search[i] == 'string' && typeof str_value == 'string') {
							if (str_value.indexOf(search[i].toUpperCase()) > -1) {
								__status = true;
								break;
							}
						} else {
							if (value == search[i]) {
								__status = true;
								break;
							}
						}
					}
					
					if (__status) {
						return true;
					}
				}
				
				return false;
			})  
		} else {
			tmp = results;
		}
		
		return tmp;
	}
	
	
	//. and operator
	readAndSearch(results, search) {
		var tmp
		if (search && search.length > 0) {
					
			tmp = results.filter(function(item) {
	
				for (let i = 0; i < search.length; i++) {
					var __status = false;
					
					for (var key in item) {
						var value = item[key];
						
						if (typeof search[i] == 'string') {
							
							if (Array.isArray(value) || typeof value == 'number' ) {
								value = value.toString();
							} 
							
							if (typeof value == 'string') {
								value = value.toUpperCase();  
								if (value.indexOf(search[i].toUpperCase()) > -1) {
									__status = true;
									break;
								}
							}
							
						} else {
							if (value == search[i]) {
								__status = true;
								break;
							}
						}
					}
					
					if (!__status) {
						return false;  
					}
				}
				
				return true;
			})  
		} else {
			tmp = results;
		}
		
		return tmp;
	}	
}

module.exports = CoCreateList;