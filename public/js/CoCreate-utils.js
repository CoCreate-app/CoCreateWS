
/**
 * Created by jin
 * 2020-04-03
 */
 
CoCreateUtils = {
  
  getRandomString : function (length = 8) {
    let result           = '';
    let stringCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    let stringCharactersLength = stringCharacters.length;
    let charactersLength = characters.length;
    
    result += stringCharacters.charAt(Math.floor(Math.random() * stringCharactersLength));
    
    for ( let i = 0; i < length - 1; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  
  generateUUID : function(length = 10) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    var d = new Date().toTimeString();
    var random = d.replace(/[\W_]+/g, "").substr(0,6);
    result += random;
    return result;
  },
  
  encodeBase64: function(str) {
    var encodedString = btoa(str);
    return encodedString;
  },
  
  existAttribute: function(el, attr) {
    const value = el.getAttribute(attr) || "";
    if (value == "") {
      return false;
    } 
    return true;
  },
  
  setAttributeForPass: function (el, doc_id) {
      el.setAttribute('data-document_id', doc_id);
      el.setAttribute('data-fetch_document_id', doc_id);
      el.setAttribute('data-pass_document_id', doc_id);
  },
  
  setDocumentIDOfElement: function(element, document_id) {
    let old_document_id = element.getAttribute('data-document_id');
    if (!old_document_id || old_document_id == "" || old_document_id == "pending") {
      element.setAttribute('data-document_id', document_id);
    }
  },
  
  isRealTime: function(element, parent_realTime) {
    let realtime = element.getAttribute('data-realtime') || parent_realTime;
    if (realtime === "false") {
      return false;
    } 
    
    return true
  },
  
  getParentFromElement: function(element, parent_class) {
    if (element.classList.contains(parent_class)) {
      return element;
    }
  
    let node = element.parentNode;
    while (node != null && node.classList) {
      if (node.classList.contains(parent_class)) {
        return node;
      }
      node = node.parentNode;
    }
    return false;
  },
  
  isReadValue: function (element) {
    return element.getAttribute('data-read_value') != "false";
  },
  
  isJsonString: function(str_data) {
    try {
			let json_data = JSON.parse(str_data);
			if (typeof json_data === 'object' && json_data != null) {
				return true;
			} else {
				return false;
			}
		} catch (e) {
			return false;
		}
  },
  disableAutoFill: function(element) {
    if (element.tagName == "TEXTAREA") {
      element.value = "";
      element.setAttribute("autocomplete","off")
    }
    if (!element.hasAttribute("autocomplete")) {
      element.setAttribute('autocomplete', "off");
    }
  }
}

