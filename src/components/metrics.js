
const CoCreateBase = require("../core/CoCreateBase");
const process = require("process")

class CoCreateMetrics extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.metrics = new Map();
		this.cycleTime = 60;
		
		this.staticMemorySize = "10";
		
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('setBandwidth', 	(socket, data) => this.setBandwidth(data));
			this.wsManager.on('createMetrics', 	(socket, data) => this.create(data));
			this.wsManager.on('deleteMetrics', 	(socket, data) => this.remove(data));
			this.wsManager.on('changeCountMetrics', (socket, data) => this.changeCount(data))
		}

		let self = this;
		this.timer = setInterval(() => {
			self.store();
		}, self.cycleTime * 1000);
	}
	
	__refresh() {
		let date = new Date();
		let strDate = date.toISOString();
		
		this.metrics.forEach((item, org) => {
			item.time = strDate;
			item.in_size = [];
			item.out_size = [];
			item.memory_size = [];
		})
	}
	
	setBandwidth({type, data, org_id, total_cnt}) {
		try {
			let date = new Date();
			let size = 0;
			
			type = type || 'in'
			
			if (data instanceof Buffer) {
				size = data.byteLength;
			} else if (data instanceof String || typeof data === 'string') {
				size = Buffer.byteLength(data, 'utf8');
			}
			
			if (size > 0 && org_id) {
	
				let item = this.metrics.get(org_id);
				if (!item) return
				
				item.time = date.toISOString();
				
				if (type == "in") {
				   item.in_size.push(size);
				} else {
				   item.out_size.push(size);
				}
			}
			
		} catch (err) {
			console.log(err)
		}
	}
	
	setMemory({data, org_id}) {
		if (data > 0 &&  org_id) {
			let item = this.metrics.get(org_id)
			if (!item) return
			
			item.memory = data;
			item.memory_cnt = 0;
		}
	}
	
	create({org_id, client_cnt, total_cnt}) {
		if (!org_id || org_id == 'users') return;
		
		let metric = this.metrics.get(org_id);
		
		if(!metric) {
			this.metrics.set(org_id, 
			{
				in_size: [],
				out_size: [],
				memory_size: [],
				total_cnt: total_cnt,
				client_cnt: client_cnt
			})	
		} else {
			metric.client_cnt = client_cnt;
		}
	}
	
	remove({org_id}) {
		this.metrics.delete(org_id)
	}
	
	changeCount({org_id, total_cnt, client_cnt}) {
		if (!org_id || org_id == 'users') return;
		let metric = this.metrics.get(org_id)
		if (!metric) {
			metric.total_cnt = total_cnt;
			metric.client_cnt = client_cnt;
		}
	}
	
	async store() {
		let date = new Date();
		let self = this;
		
		let total_cnt = 0;
		this.metrics.forEach((item, org) => {total_cnt += item.client_cnt})

		const used = process.memoryUsage();
		let totalMemory = used.heapUsed;
		
		await this.metrics.forEach(async (item, org) => {

			let inSize = 0, outSize = 0, memorySize = 0
			inSize = item.in_size.reduce((a, b) => a + b, 0);
			outSize = item.out_size.reduce((a, b) => a + b, 0);
			
			let maxIn = 0, maxOut = 0
			
			if (inSize > 0) {
				inSize = inSize / item.in_size.length;
				maxIn = Math.max(...item.in_size);
			}
			
			if (outSize > 0) {
				outSize = inSize / item.out_size.length;
				maxOut = Math.max(...item.out_size);
			}
			
			//. calcuate memory size
			// memorySize = (item.client_cnt / total_cnt) * totalMemory + inSize + outSize;
			memorySize = maxIn > maxOut ? maxIn : maxOut;
			
			let dbSize = await self.getDB(org).stats()
			delete dbSize['$clusterTime'];

			await self.storeMetrics({
				organization: org,
				date: date,
				in_size: inSize,
				out_size: outSize,
				memory_size: memorySize,
				client_cnt: item.client_cnt,
				db_size: dbSize
			});
		})
		this.__refresh();
	}

	/** store metrics **/
	async storeMetrics(data){
		if(!data || !data.organization) return;
		
		try{
			var collection = this.getDB(data.organization).collection('jin_metrics_crud');
			await collection.insertOne(data);
		}catch(error){
			console.log('createDocument error', error);
		}
	}
}

module.exports = CoCreateMetrics;
