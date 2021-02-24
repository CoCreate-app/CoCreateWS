class CoCreateMetrics {
	
	constructor() {
		this.metrics = new Map();
		this.cycleTime = 5;
		
		this.init()
	}
	
	init() {
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

			item.in = 0;
			item.in_cnt = 0;
			item.out = 0;
			item.out_cnt = 0;
			item.memory = 0;
			item.memory_cnt = 0;
		})
	}
	
	setBandwidth(type, data, orgId) {
		try {
			let date = new Date();
			let size = 0;
			
			type = type || 'in'
			
			if (data instanceof Buffer) {
				size = data.byteLength;
			} else if (data instanceof String || typeof data === 'string') {
				size = Buffer.byteLength(data, 'utf8');
			}
			
			if (size > 0 && orgId) {
	
				let item = this.metrics.get(orgId);
				if (!item) return
				
				item.time = date.toISOString();
				
				if (type == "in") {
				   item.in += size;
				   item.in_cnt ++;
				} else {
				   item.out += size;
				   item.out_cnt ++;
				}
			}
			
		} catch (err) {
			console.log(err)
		}
	}
	
	setMemory(data, org_id) {
		if (data > 0 &&  org_id) {
			let item = this.metrics.get(org_id)
			if (!item) return
			
			item.memory = data;
			item.memory_cnt = 0;
		}
	}
	
	create(org_id, client_cnt) {
		if (!org_id || org_id == 'users') return;
		
		let metric = this.metrics.get(org_id);
		
		if(!metric) {
			this.metrics.set(org_id, 
			{
				in: 0,
				in_cnt: 0,
				out: 0,
				out_cnt: 0,
				memory: 0,
				memory_cnt: 0,
				client_cnt: client_cnt
			})	
		} else {
			metric.client_cnt = client_cnt;
		}
	}
	
	remove(org_id) {
		this.metrics.delete(org_id)
	}
	
	store() {
		let date = new Date();
		let strDate = date.toISOString();

		this.metrics.forEach((item, org) => {
			
			
			let inSize = 0, outSize = 0, memorySize = 0
			
			if (item.in_cnt > 0) {
				inSize = item.in / item.in_cnt;
			}
			
			if (item.out_cnt > 0) {
				outSize = item.out / item.out_cnt;
			}
			
			if (item.memory_cnt > 0) {
				memorySize = item.memory_cnt;
			}
			console.log(`${strDate} \t ${org} \t ${inSize} \t ${outSize} \t ${memorySize} \t ${item.client_cnt}`);
		})
		this.__refresh();
	}
}

module.exports = new CoCreateMetrics()