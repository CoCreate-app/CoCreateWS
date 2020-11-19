function CoCreateDocument() {
		this.name = "CoCreateDocument";
		console.log(this.name);
}

//. init

CoCreateSocket.listen('createDocument', function(data) {
	console.log('xxxxxxxxxxxxxxxxxxx');
  CoCreateDocument.receivedDocumentId(data);
  
})

CoCreateDocument = {
	
	requestAttr: "data-document_request",
	
	init: function() {
	},
	
	checkID: function(element, attr = "data-document_id") {
		let document_id = element.getAttribute(attr) || "";

		if (document_id === "" || document_id === "pending") {
			return false;
		}
		return true;
	},
	
	__setID: function(element, document_id, attr) {
	  if (!this.checkID(element, attr)) {
	  	element.setAttribute(attr, document_id);
	  }
	},
	
	__setNewIdProcess: function(element, document_id, pass) {
		if (!element) return;
		
  	element.removeAttribute(this.requestAttr);
  	var status = false;
		const event_data = {
			document_id: document_id,
		}

  	if (!pass && !this.checkID(element)) {
  		if (CoCreateUtils.existAttribute(element, 'name')) {
		 		element.setAttribute('data-document_id', document_id);
				status = true;	
  		}
  	}

  	if (pass && !this.checkID(element, 'data-pass_document_id')) {
			if (CoCreateUtils.existAttribute(element, 'data-pass_to')) {
				element.setAttribute('data-pass_document_id', document_id);
				status = true;
				// CoCreateLogic.storePassData(element)
				
				if (element.parentNode.classList.contains('submitBtn')) {
					element.click();
				}
			}
  	}
  	
		var event = new CustomEvent('set-document_id', {detail: event_data})
		element.dispatchEvent(event);

	},
	
	receivedDocumentId: function(data) {
		if (!data['document_id']) {
			return;
		}

	  let element = document.querySelector(`[${this.requestAttr}="${data['element']}"]`);
	  if (!element) return;
	  let _this = this;
	  const form = (element.tagName === "FORM") ? element : this.getParents(element, 'form');
	  const collection = data['collection'];
	  const id = data['document_id']
	  if (form && id) {
	  	
	  	const elements = form.querySelectorAll(`[data-collection=${collection}], [data-pass_collection=${collection}]`)
	  	
	  	elements.forEach(function(el) {
	  		el.removeAttribute(this.requestAttr);
	  		if (CoCreateUtils.existAttribute(el, 'name')) {
		  		_this.__setNewIdProcess(el, id);
	  		}
	  		
	  		if (CoCreateUtils.existAttribute(el, 'data-pass_to')) {
	  			_this.__setNewIdProcess(el, id, true);
	  		}
	  	})
	  	
	  } else if (element) {
	  	this.__setNewIdProcess(element, id);
	  }
	},
	
	requestDocumentId: function(element, nameAttr = "name", value = null) {
		//. check element
		const collection = element.getAttribute('data-collection')
		const name = element.getAttribute(nameAttr)
		
		if (!collection || !name) {
			return 
		}
		
		const request_id = CoCreateUtils.generateUUID();

		element.setAttribute(this.requestAttr, request_id);
		/* FixME Create Document request */		
		CoCreate.createDocument({
			"collection": collection,
			"element": request_id,
			"metadata": "",
		})
	},
	
	requestDocumentIdOfForm: function (form) {
		
		let _this = this;
		let elemens = form.querySelectorAll('[name], [data-pass_to]')
		
		let collections = [];

		for (var  i = 0; i < elemens.length; i++) {
			let el = elemens[i];
			if (el.parentNode.classList.contains('template')) {
				continue;
			}
			const collection = el.getAttribute("data-collection") || el.getAttribute("data-pass_collection") || "";	
			
			if (
				collection !== "" && 
				!collections.includes(collection) && 
				(!_this.checkID(el, 'data-document_id') && !_this.checkID(el, 'data-pass_document_id'))
			) {
				const request_id = CoCreateUtils.generateUUID();
				collections.push(collection);

				el.setAttribute(this.requestAttr, request_id);
				/* FixME Create Document request */	
				CoCreate.createDocument({
					"collection": collection,
					"element": request_id,
					"metadata": "",
				})
			}
		}
	},
	
	
	getParents: function(element, selector = "form") {
		if (!Element.prototype.matches) {
  			Element.prototype.matches =	Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector ||	Element.prototype.oMatchesSelector ||	Element.prototype.webkitMatchesSelector ||
  			
  			function(s) {
  				var matches = (this.document || this.ownerDocument).querySelectorAll(s),
  					i = matches.length;
  				while (--i >= 0 && matches.item(i) !== this) {}
  				return i > -1;
  			};
  	}
  
  	for ( ; element && element !== document; element = element.parentNode ) {
  		if ( element.matches( selector ) ) return element;
  	}
  	return null;
	}
}

CoCreateDocument.init();

