
CoCreateLogic = {
	
	init: function() {
		this.initKeys();
		this.initPassSessionIds();
		this.initPassParams();
		this.initPassValueParams();
		this.initValuePassBtns();
		this.initGetValueInput();
		
		this.initLink();
	},
		
	// getKeys
	initKeys: function() {
		if (localStorage.getItem('apiKey')) {
			config.apiKey = localStorage.getItem('apiKey');
		}
		if (localStorage.getItem('securityKey')) {
			config.securityKey = localStorage.getItem('securityKey');
		}
		if (localStorage.getItem('organization_id')) {
			config.organization_Id = localStorage.getItem('organization_id');
		}
	},
	
	//. passSessionIds
	initPassSessionIds: function() {
		let orgId = localStorage.getItem('organization_id');
		let user_id = localStorage.getItem('user_id');
		let adminUI_id = localStorage.getItem('adminUI_id');
		let builderUI_id = localStorage.getItem('builderUI_id');

		this.__initPassItems(orgId, 			".sessionOrg_Id", true);
		this.__initPassItems(user_id, 		".sessionUser_Id");
		this.__initPassItems(adminUI_id,	".sessionAdminUI_Id");
		this.__initPassItems(builderUI_id,".sessionBuilderUI_Id");
	},
	
	//. passParams
	initPassParams: function() {
		var dataParams = localStorage.getItem('dataParams');
		dataParams = JSON.parse(dataParams);

		if (!dataParams || dataParams.length == 0) return;
		let _this = this;		
		dataParams.forEach(function(dataParam) {
			var param_collection = dataParam.collection;
			var param_document_id = dataParam.document_id;
			var param_prefix = dataParam.prefix;
			var param_pass_to = dataParam.pass_to;
			
			var forms = document.querySelectorAll('form');
			
			forms.forEach((form) => {
				var pass_id = form.getAttribute('data-pass_id');
				if (pass_id && pass_id == param_pass_to && param_collection && param_collection != "") {
					if (!form.getAttribute('data-collection')) {
						form.setAttribute('data-collection', param_collection);    
					}
				}
			})

			var allTags = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, i, q, a, b, li, ul, span, code, img, head, body, input, textarea, select, table, div, html');
			
			allTags.forEach((tag) => {
				var pass_id = tag.getAttribute('data-pass_id');
				if (pass_id && pass_id == param_pass_to && param_document_id) {
					_this.__setAttributeIntoEl(tag, param_document_id)
				}
			})
			
			var displayList = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, i, q, a, b, li, ul, span, code, img, head, body, table, html, div');
			
			displayList.forEach((display) => {
				var pass_id = display.getAttribute('data-pass_id');
			
				if (pass_id && pass_id == param_pass_to) {
					// if (!display.getAttribute('data-fetch_value')) {
					// 	display.setAttribute('data-fetch_value', param_document_id);
					// }
					
					if (display.classList.contains('template-wrapper')) {
						if (dataParam.fetch_name) {
							display.setAttribute('data-fetch_name', dataParam.fetch_name);
						}
						
						if (dataParam.fetch_value) {
							display.setAttribute('data-fetch_value', dataParam.fetch_value);
						}
					}

					if (param_collection && param_collection != "") {
						if (!display.getAttribute('data-collection')) {
							display.setAttribute('data-collection', param_collection);    
						}
						
						if (!display.getAttribute('data-pass_collection')) {
							display.setAttribute('data-pass_collection', param_collection);
						}
						
						if (!display.getAttribute('data-fetch_collection')) {
							display.setAttribute('data-fetch_collection', param_collection);
						}
						
					}
					
					if (param_prefix) {
						display.setAttribute('prefix', param_prefix);
						display.setAttribute('data-pass_prefix', param_prefix);  
					}
				}    	
			}) 
		})		
	},
	
	// passValueParams
	initPassValueParams: function() {
		var valueParams = localStorage.getItem('valueParams');
		valueParams = JSON.parse(valueParams);
		
		if (!valueParams || valueParams.length == 0) return;
		
		valueParams.forEach(function(valueParam) {
			var pass_value_to = valueParam.pass_value_to;
			var inputs = document.querySelectorAll('input, textarea, select');
			
			inputs.forEach((input) => {
				let pass_value_id = input.getAttribute('data-pass_value_id');
				
				if (pass_value_id && pass_value_id == pass_value_to) {
					input.value = valueParam.value;
					updateFloatLabel(input);
				}	    	
			})
		})		
	},
	
	//. storePassData
	storePassData: function(aTag) {
		var dataParams = [];
				
		var collection = aTag.getAttribute('data-pass_collection');
		var document_id = aTag.getAttribute('data-pass_document_id');
		var prefix = aTag.getAttribute('data-pass_prefix');
		var pass_to = aTag.getAttribute('data-pass_to');
		var pass_fetch_name = aTag.getAttribute('data-pass_fetch_name')
		var pass_fetcn_value = aTag.getAttribute('data-pass_fetch_value')
		
		if (pass_to) {
			var param = {
				collection: collection,
				document_id: document_id,
				prefix: prefix,
				pass_to: pass_to,
				fetch_name: pass_fetch_name,
				fetch_value: pass_fetcn_value
			};
		
			dataParams.push(param);
			this.initTemplateByPass(pass_to, param);
		}
		
		var tags = aTag.querySelectorAll('[data-pass_to]');
		
		tags.forEach((tag) => {
			const collection = tag.getAttribute('data-pass_collection');
			const document_id = tag.getAttribute('data-pass_document_id');
			const prefix = tag.getAttribute('data-pass_prefix');
			const pass_to = tag.getAttribute('data-pass_to');
			const pass_fetch_name = aTag.getAttribute('data-pass_fetch_name')
			const pass_fetcn_value = aTag.getAttribute('data-pass_fetch_value')
			
			if (pass_to) {
				var param = {
					collection: collection,
					document_id: document_id,
					prefix: prefix,
					pass_to: pass_to,
					fetch_name: pass_fetch_name,
					fetch_value: pass_fetcn_value
				};
			
				dataParams.push(param);
			}			
		})

		if (dataParams.length > 0) localStorage.setItem('dataParams', JSON.stringify(dataParams));
	},
	
	//. initTemplateByPass
	initTemplateByPass: function(pass_id, param) {
		let templates = document.querySelectorAll('.template-wrapper[data-pass_id="' + pass_id + '"]')

		for(var  i = 0; i < templates.length; i++) {
			let tmp = templates[i];
			tmp.setAttribute('data-fetch_collection', param.collection);
			if (param.fetch_name) {
				tmp.setAttribute('data-fetch_name', param.fetch_name)
			}
			if (param.fetch_value) {
				tmp.setAttribute('data-fetch_value', param.fetch_value)
			}
			initTemplateByElement(tmp, true);
		}
	},
	
	//. initValuePassBtns
	initValuePassBtns: function() {
		let forms = document.getElementsByTagName('form');
	
		for (let i=0; i < forms.length; i++) {
			let form = forms[i];
			
			let valuePassBtn = form.querySelector('.passValueBtn');
			
			if (valuePassBtn) this.__registerValuePassBtnEvent(form, valuePassBtn);
		}
	},
	
	initGetValueInput: function() {
		var inputs = document.querySelectorAll('input, textarea');
		let _this = this;
		
		for (var i = 0; i < inputs.length; i++) {
		  var input = inputs[i];
		  
		  if (!input.id) {
		  	continue;
		  }
		  
		  input.addEventListener('input', function(e) {
		  	_this.__setGetValueProcess(this.id, this.value)
		  })
		  
		  input.addEventListener('updated_by_fetch', function(e) {
		  	_this.__setGetValueProcess(this.id, this.value);
		  })
		}
	},
	
	//. initValuePassBtn
	__registerValuePassBtnEvent: function(form, valuePassBtn) {
		let _this = this;
		valuePassBtn.addEventListener('click', function(e) {
			let inputs = form.querySelectorAll('input, textarea, select');
			
			let valueParams = [];
			
			for (let i = 0; i < inputs.length; i++) {
				let input = inputs[i];
				
				let pass_value_to = input.getAttribute('data-pass_value_to');
				let value = input.value;
				
				if (pass_value_to) {
					valueParams.push({
						pass_value_to: pass_value_to,
						value: value
					})
				}
			}
			
			if (valueParams.length > 0) localStorage.setItem('valueParams', JSON.stringify(valueParams));
			
			_this.passValueParams();
			
			let aTag = valuePassBtn.querySelector('a');
			
			if (aTag) _this.setLinkProcess(aTag);
		})
	},
	
	initLink: function() {
		var aTags = document.getElementsByTagName('a');
		for (var i = 0; i < aTags.length; i++) {
			this.initATagEvent(aTags[i]);
		}
	},
	
	//. initATag
	initATagEvent: function(aTag) {

		var href = aTag.getAttribute('href');
		var isModal = this.checkOpenCocreateModal(aTag);
		let _this = this;

		if (isModal) {
		  return;
		}
		
	  if (href) {
			aTag.addEventListener('click', function(e) {
			  e.preventDefault();
			  if (!_this.passSubmitProcess(aTag)) {
			  	return;
			  }
			  _this.storePassData(aTag);
				_this.openAnother(aTag);
			})
		} else {
		  aTag.addEventListener('click', function(e) {
		  	if (!_this.passSubmitProcess(aTag)) {
		  		return;
		  	}
	  	  _this.storePassData(aTag);
	  	  _this.initPassParams();
	      CoCreate.fetchModules()
	  	})
		}
	},
	
	//. openAnother
	openAnother: function(atag) {

		var href = atag.getAttribute('href');
		var target = atag.getAttribute('target');
		
		if (target == "_blank") {
		  window.open(href, "_blank");  
		} else if (target == "_window") {
		  window.open(href, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
		} else {
		  window.open(href, "_self");
		}
	},
	
	//. clickATaginButton
	setLinkProcess: function(aTag) {
		var href = aTag.getAttribute('href');
	  _this.storePassData(aTag);
		if (this.checkOpenCocreateModal(aTag)) {
			if (g_cocreateWindow) {
			  g_cocreateWindow.openWindow(aTag);
			}
		} else if (href) {
			this.openAnother(aTag);
		} else {
		  _this.initPassParams();
	    //init();
	    CoCreate.fetchModules()
		}
	},
	
	//. checkOpenCocreateModal
	checkOpenCocreateModal: function(atag) {
	  if (atag.getAttribute('target') === "modal") {
	    return true;
	  } 
	  return false;
	},
	
	passSubmitProcess: function(element) {
		if (element.parentNode.classList.contains('submitBtn')) {
			if ( element.getAttribute('data-pass_to') && element.getAttribute('data-pass_document_id')) {
				return true;
			} else {
				return false
			}
		} else {
			return true;
		}
	},
	

	
	__setGetValueProcess: function(id, value) {
		
		if (!id) return;
  
    var targets = document.querySelectorAll('[data-get_value="' + id + '"]');
    
    targets.forEach((target) => {
      // target.value = value;
      if (typeof(target.value) != "undefined") {
      	target.value = value;
      } else if (typeof(target.textContent) != "undefined") {
      	target.textContent = value;
      }
      
      updateFloatLabel(target);
      
      target.dispatchEvent(new Event("input", {"bubbles":true})); 
      
      if (target.classList.contains('searchInput')) {
        let evt = new KeyboardEvent('keydown', {'keyCode': 13});
        target.dispatchEvent(evt);
      }
    })
	},
	
	__initPassItems: function(id, selector, noFetch) {
		const _this = this;
		if (id) {
			let elements = document.querySelectorAll(selector);
			elements.forEach(el => {
				_this.__setAttributeIntoEl(el, id, noFetch);
			})
		}
	},
	
	__setAttributeIntoEl: function(el, id, noFetch) {
		
		el.setAttribute('data-document_id', id);
		if (noFetch) {
			el.setAttribute('data-fetch_document_id', id);
		}
		// el.setAttribute('data-fetch_value', id);
		el.setAttribute('data-pass_document_id', id);
	}
}
