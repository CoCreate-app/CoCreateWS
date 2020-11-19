

CoCreateInput = {
	
	selector: "input, textarea, select",
	
	init: function() {
		registerModuleSelector(this.selector);
		CoCreate.registerModule('input', this, null, this.getReqeust, this.renderData)
		
		let inputs = document.querySelectorAll(this.selector);
		let _this = this;
		
		inputs.forEach((input) => {
			
			const collection = input.getAttribute('data-collection')
			if (CoCreateUtils.isJsonString(collection)) {
				return;
			}
			
			if (_this.isUsageY(input)) {
				return;
			}	
			_this.initEvents(input);
		})
	},
	
	getReqeust: function(container) {
		
		let fetch_container = container || document;
		let inputs = fetch_container.querySelectorAll(this.selector)
		let requestData = [];

		inputs.forEach((input) => {
			if (CoCreateInput.isUsageY(input)) return;
			
			const collection = input.getAttribute('data-collection')
			const id = input.getAttribute('data-document_id')
			
			if (id && !requestData.some((d) => d['collection'] === collection && d['document_id'] === id)) {
				requestData.push({ 
					'collection': collection, 
					'document_id': id 
				})
			}
		})
		return requestData;
	},
	
	renderData: function (data) {
		let inputs = document.querySelectorAll(this.selector)
		let _this = this;
		
		inputs.forEach((input) => {
			if (_this.isUsageY(input)) return;
			
			const collection = input.getAttribute('data-collection')
			const id = input.getAttribute('data-document_id')
			const name = input.getAttribute('name')
			const data_fetch_value = input.getAttribute('data-fetch_value');
			
			if (data_fetch_value === "false" || !CoCreateUtils.isReadValue(input)) return;
			
			if (data['collection'] == collection && data['document_id'] == id && (name in data.data)) {
				_this.setValue(input, data['data'][name]);
			}
		})
		
	},
	
	initEvents: function(input) {
		
		let _this = this;
		input.addEventListener('clicked-submitBtn', function() {
			_this.saveValueIntoDB(this)
		})
		
		input.addEventListener('set-document_id', function() {
			CoCreate.initDataCrdt({
				collection: input.getAttribute('data-collection'),
				document_id: input.getAttribute('data-document_id'),
				name: input.getAttribute('name'),
				element: input
			})
			_this.saveValueIntoDB(this)
		})
		
		input.addEventListener('input', function(e) {
			if (CoCreateUtils.isRealTime(this)) {
				_this.saveValueIntoDB(this)
			}
		})
		
		input.addEventListener('change', function(e) {
			if (this.tagName == 'SELECT' && CoCreateUtils.isRealTime(this)) {
				_this.saveValueIntoDB(this)
			}
		})
		
		CoCreateSocket.listen('updateDocument', function(data) {
	    _this.renderData(data);
	  })
	  
	  //. create store observer(yjs)
		CoCreate.initDataCrdt({
			collection: input.getAttribute('data-collection'),
			document_id: input.getAttribute('data-document_id'),
			name: input.getAttribute('name'),
			element: input
		})
	},
	
	saveValueIntoDB: function (input) {
		
		const value = this.getValue(input);
		const collection = input.getAttribute('data-collection') || 'module_activity'
		
		const document_id = input.getAttribute('data-document_id')
		const name = input.getAttribute('name')
    CoCreate.replaceDataCrdt({
      collection, document_id, name, value,
      update_crud: true
    })
	},
	
	isUsageY: function(input) {
		if (CoCreateUtils.isJsonString(input.getAttribute('data-collection'))) {
			return false;
		}
		
		if (CoCreateUtils.isJsonString(input.getAttribute('name'))) {
			return false;
		}
		
		if ((input.tagName === "INPUT" && ["text", "number", "email", "tel", "url"].includes(input.type)) || input.tagName === "TEXTAREA") {
			
			if (!input.getAttribute('name')) {
				return false;
			}
			if (input.getAttribute("data-realtime") == "false") {
				return false;
			}
			
			if (!CoCreateUtils.isReadValue(input)) {
				return false;
			}
			return true;
		}
		return false;
	},
	
	getValue: function(input) {
		let value = input.value;
		
		if (input.type === "checkbox") {
			value = input.checked
		} 
		else if (input.type === "number") {
			value = Number(value)
		}
		else if (input.type === "password") {
			value = this.encryptPassword(value)
		}
		return value;
	},
	
	setValue: function(input, value) {
		if (input.type == 'checkbox') {
			input.checked = value;
		} 
		else if (input.type === 'radio') {
			input.value == value ? input.checked = true : input.checked = false
		}
		
		input.value = value;
		
		updateFloatLabel(input, value)
	},
	
	encryptPassword: function(str) {
		var encodedString = btoa(str);
		return encodedString;
	}
	
}

CoCreateInput.init();