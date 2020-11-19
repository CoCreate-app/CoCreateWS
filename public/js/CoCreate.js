/**
 * Init CoCreate socket
 */

if (config && config.organization_Id) {
	CoCreateSocket.create({namespace: config.organization_Id, room: null});
	CoCreateSocket.setGlobalScope(config.organization_Id);
} else {
	CoCreateSocket.create({namespace: null, room: null});
}


// ***********   define variables  ***************** ///

var deleteClass="delete-document";

var formDatas = {};

var g_moduleSelectors = [];

let g_Modules = []

// ***********   define variables end ***************** /// 

CoCreateLogic.init();

// window.onload = function() {
  initSockets();
// }

function registerModuleSelector(selector) {
  if (g_moduleSelectors.indexOf(selector) === -1) {
    g_moduleSelectors.push(selector);
  }
}


function initSockets() {
  
  CoCreateSocket.listen('connect', function (data, room) {
    console.log('socket connected', room)
    if (room == CoCreateSocket.getGlobalScope()) {
      socketConnected();
    }
  })
  
  CoCreateSocket.listen('checkedUnique', function(data) {
    checkedUnique(data);
  })
  
  CoCreateSocket.listen('securityError', function(data) {
    console.error('invalide api key and security key');
  })
  
  CoCreateSocket.listen('createDocument', function(data) {
    console.log('created a document: ', data);
  })
  
  CoCreateSocket.listen('readDocument', function(data){
    const metadata = data.metadata;
    if (metadata && metadata.type == 'crdt') {
      //. init y-websocket
      CoCreate.initRenderCrdtData(data);
    } else {
      CoCreate.renderModules(data)
    }
  })
  
  CoCreateSocket.listen('updateDocument', function(data) {
    // console.log('update a document', data);
    CoCreate.renderModules(data)
  })
  
  CoCreateSocket.listen('deletedDocument', function(data) {
    console.log(data);
  })
  
}

function socketConnected() {
  ////   check session

  ////init
  CoCreateForm.init();
  CoCreate.fetchModules();
  initDeleteTags();
}


/* this is to validate if the value already exists DB. used for email or username where no duplicate can exist */
function checkedUnique(data) {
  var form_id = data['form_id'];
  
  var validates = formDatas[form_id].validates;
  
  
  //// insert class
  var form = document.querySelector("form[data-form_id='" + form_id + "']");
  if (form) {
    var queryStr = "input[name='" + data['name'] + "'], textarea[name='" + data['name']  + "']";
    var input = form.querySelector(queryStr);
    
    if (input) {
      if (data['unique']) {
        input.classList.remove('data-unique-error');
        input.classList.add('data-unique-success');  
      } else {
        input.classList.remove('data-unique-success');
        input.classList.add('data-unique-error');
      }
    }
    
  }
  
  for (var i=0; i < validates.length; i++) {
    var validate = validates[i];
    if (validate.name ==data['name']) {
      validate.unique = data['unique'];
      
      return;
    }
  }
  
  validates.push({
    name: data['name'],
    unique: data['unique']
  })
}

// rename to initDeleteDocument
function initDeleteTags() {
  var dTags = document.querySelectorAll('.' + deleteClass);
  
  for (var i=0; i<dTags.length; i++) {
    var dTag = dTags[i];
    
    dTag.addEventListener('click', function(e) {
      e.preventDefault();
      
      var collection = this.getAttribute('data-collection') || 'module_activity';
      var documentId;
      
      documentId = this.getAttribute('data-document_id');

      if (document) {
        CoCreate.deleteDocument({
          'collection': collection, 
          'document_id': documentId,
          'metadata': '' 
        });
      }
    })
  }
}

// rename to initFloatLabel
function updateFloatLabel(node, value) {}


CoCreate = {
  modules: {},
  
  registerModule: function(name, instance, initFunc, fetchFunc, renderFunc) {
    
    if (this.modules[name]) {
      return;
    }
    
    this.modules[name] = {
      instance, 
      fetchFunc,
      renderFunc,
      initFunc
    }
  },
  
  /** Module Processing Functions **/
  initModules: function(container) {
    let keys = Object.keys(this.modules);
    
    for (var i = 0; i < keys.length; i++) {
      const module = this.modules[keys[i]];
      if (module && module.initFunc) {
        module.initFunc.call(module['instance'], container);
      }
    }
  },
  
  runInitModule: function (key, container) {
    if (!this.modules[key]) {
      return;
    }
    const module = this.modules[key];
    module.initFunc.call(module['instance'], container);
  },
  
  fetchModules: function(container) {
    var fetchDocuments = []; 
    
    let keys = Object.keys(this.modules);
    for (var i = 0; i < keys.length; i++) {
      const module = this.modules[keys[i]]
      if (module && module.fetchFunc) {
        fetchDocuments = fetchDocuments.concat(module.fetchFunc.call(module['instance'], container));
      }
    }
  
    /** remove duplication information **/
    let fetchInfo = [];
    let _this = this;
    fetchDocuments.forEach((item) => {
      if (!fetchInfo.some((info) => (info['collection'] == item['collection'] && info['document_id'] === item['document_id']))) {
        _this.getDocument({
          'collection': item['collection'], 
          'document_id': item['document_id']
        });
        fetchInfo.push(item);
      }
    })
  },
  
  renderModules: function(data, container) {
    let keys = Object.keys(this.modules);
    
    for (var i = 0; i < keys.length; i++) {
      const key = keys[i];
      const module = this.modules[keys[i]];
      if (module && module.renderFunc) {
        module.renderFunc.call(module['instance'], data, container)
      }
    }
  },
  
  
  /** Get common paraeter  **/
  getCommonParams: function() {
    return {
      "apiKey":           config.apiKey,
      "securityKey":      config.securityKey,
      "organization_id":  config.organization_Id,
    }
  },
  
 
  /*
  readDocument({
    collection: "module",
    document_id: "",
    data:[
    {name: “name1”},
    {name: “name2”}
    ],
    element: “xxxx”,
    metaData: "xxxx"
  }),
  */
  readDocument: function(info){
    if( !info || !info['document_id'] ) return;
    
    let request_data = this.getCommonParams();
    request_data['collection'] = info['collection'] || 'module_activities';
    request_data['document_id'] = info['document_id'];
    
    if(Array.isArray(info.data))
      request_data['filters'] = info.data.reduce((r, d) => {r[d.name] = 1; return r}, {});
    else request_data['filters'] = {};
    
    request_data['element'] = info.element;
    request_data['metaData'] = info.metaData;
    
    CoCreateSocket.send('readDocument', request_data);
  },
  
  /*
   
    readDcoumentList {
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
          operator: "contain | range | eq | ne | lt | lte | gt | gte | in | nin",
          value: [v1, v2, ...]
        }, {
          name: "_id",
          opreator: "in",
          value: ["id1"]
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
      
      
      -------- additional response data -----------
      data: [] // array
    }
  */
  
  readDocumentList(info){
    if( !info ) return;
    let request_data = this.getCommonParams();
    
    if (!info.collection || !info.operator) {
      return;
    }
    
    request_data = {...request_data, ...info};
    
    console.log(request_data)
    CoCreateSocket.send('readDocumentList', request_data);
  },
  
  
  /*
  createDocument({
    namespace:'',
    room:'',
    collection: "test123",
    data:{
    	name1:“hello”,
    	name2:  “hello1”
    },
    element: “xxxx”,
    metaData: "xxxx"
  }),
  */
    createDocument: function(info) {
    if (info === null) {
      return;
    }
    let request_data = this.getCommonParams()
    request_data['collection'] = info['collection'] || 'module_activities';
    
    let data = info.data || {};
    
    if (!data['organization_id']) {
      data['organization_id'] = config.organization_Id
    }

    request_data['data'] = data;
    if (info['metadata']) {
      request_data['metadata'] = info['metadata']
    }
    
    request_data['element'] = info['element'];
    CoCreateSocket.send('createDocument', request_data);
  },
  

  /*
  updateDocument({
    collection: "test123",
    document_id: "document_id",
    data:{
    	name1:“hello”,
    	name2:  “hello1”
    },
    delete_fields:["name3", "name4"],
    element: “xxxx”,
    metaData: "xxxx"
  }),
  */
  updateDocument: function(info) {
    if( !info || !info['document_id'] ) return;
    
    let request_data = this.getCommonParams();
    request_data['collection'] = info['collection'] || 'module_activities';
    request_data['document_id'] = info['document_id'];
    
    if( typeof info['data'] === 'object' ) request_data['set'] = info['data'];
    if( Array.isArray(info['delete_fields']) ) request_data['unset'] = info['delete_fields'];
    
    if(!request_data['set'] && !request_data['unset']) return;
    
    request_data['element'] = info['element'];
    request_data['metadata'] = info['metadata'];
    
    CoCreateSocket.send('updateDocument', request_data);
  },
  
  
  /*
  getDocument({
    collection: "test123",
    document_id: "document_id",
    element: “xxxx”,
    metaData: "xxxx",
    exclude_fields: [] 
  }),
  */
  getDocument: function(info) {
    if (info === null) {
      return;
    }
    if (!info['document_id'] || !info) {
      return;
    }
    
    let request_data = this.getCommonParams();
    request_data['collection'] = info['collection'];
    request_data['document_id'] = info['document_id'];
    if (info['exclude_fields']) {
      request_data['exclude_fields'] = info['exclude_fields'];
    }
    
    if (info['element']) {
      request_data['element'] = info['element'];
    }
    
    request_data['metadata'] = info['metadata']
    CoCreateSocket.send('readDocument', request_data);
  },
  
  
  /*
  deleteDocument({
    collection: "module",
    document_id: "",
    element: “xxxx”,
    metadata: "xxxx"
  }),
  */
  deleteDocument: function(info) {
    if (!info['document_id'] || !info) {
      return;
    }
    
    let request_data = this.getCommonParams();
    request_data['collection'] = info['collection'];
    request_data['document_id'] = info['document_id'];
    
    if (info['element']) {
      request_data['element'] = info['element'];
    }
    
    request_data['metadata'] = info['metadata']
    CoCreateSocket.send('deleteDocument', request_data);
  },


  /*
    Private function to get id of ydoc
  */
  __getYDocId: function(collection, document_id, name) {
    if (!collection || !document_id || !name) {
      return null;
    }
    return CoCreateYSocket.generateID(config.organization_Id, collection, document_id, name);

  },

  /*. init data function
  replaceDataCrdt({
    collection: "module",
    document_id: "",
    name: "",
    value: "",
    update_crud: true | false,
    element: dom_object,
    metadata: "xxxx"
  })
  */
  
  replaceDataCrdt: function(info){
    if (!info) return;

    const id = this.__getYDocId(info.collection, info.document_id, info.name)
    if (!id) return;
    if (CoCreateCrdt.getType(id)) {
      let oldData = CoCreateCrdt.getType(id).toString();
      
      
      console.log(oldData)
      CoCreateCrdt.deleteData(id, 0, Math.max(oldData.length, info.value.length));
      CoCreateCrdt.insertData(id, 0, info.value);
    } else {
      this.updateDocument({
        collection: info.collection,
        document_id: info.document_id,
        data: {[info.name]: info.value},
        element: info.element,
        metadata:info.metadata 
      })
    }
    
    if (info.update_crud !== false) {
    }
  },

  /*. init data function
  inintDataCrdt({
    collection: "module",
    document_id: "",
    name: "",
    element: dom_object,
    metadata: "xxxx"
  })
  */
  initDataCrdt: function(info) {
    try {
      this.validateKeysJson(info, ['collection', 'document_id', 'name']);
      
      const id = this.__getYDocId(info['collection'], info['document_id'], info['name'])

      if (!id) return;
      const status = CoCreateCrdt.createDoc(id, info.element)

    } catch(e) {
      console.log('Invalid param', e);
    }
  },
  

  validateKeysJson: function(json,rules){
    let keys_json = Object.keys(json);
    keys_json.forEach(key=>{
      const index = rules.indexOf(key);
      if(index != -1)
        rules.splice(index, 1);
    });
    if( rules.length )
      throw "Requires the following "+ rules.toString();
  },
  
  
  /*
  CoCreate.insertDataCrdt({
	collection: 'module_activities',
	document_id: '5e4802ce3ed96d38e71fc7e5',
	name: 'name',
	value: 'T',
	position:'8
	attributes: {bold: true}
  })
  */
  insertDataCrdt: function (info) {
      try {
        this.validateKeysJson(info,['collection','document_id','name','value','position']);
        let id = this.__getYDocId(info['collection'], info['document_id'], info['name'])
        if (id) {
          CoCreateCrdt.insertData(id, info['position'], info['value'], info['attributes']);
        }
      }
      catch (e) {
         console.error(e); 
      }
  }, //end inserData
  
  
  /*
  CoCreate.deleteDataCrdt({
  	collection: 'module_activities',
  	document_id: '5e4802ce3ed96d38e71fc7e5',
  	name: 'name',
  	position:8,
  	length:2,
  })
  */
  deleteDataCrdt: function(info) {
    try{
      this.validateKeysJson(info,['collection','document_id','name', 'position','length']);
      let id = this.__getYDocId(info['collection'], info['document_id'], info['name'])
      if (id) {
        CoCreateCrdt.deleteData(id, info['position'], info['length']);
      }
    }
    catch (e) {
       console.error(e); 
    }
  },
  
  
  /*
  CoCreate.getDataCrdt({
  	collection: 'module_activities',
  	document_id: '5e4802ce3ed96d38e71fc7e5',
  	name: 'name'
  })
  */
  getDataCrdt: function(info) {
    try{
      this.validateKeysJson(info,['collection','document_id','name']);
      let id = this.__getYDocId(info['collection'], info['document_id'], info['name'])
      if (id) {
        return CoCreateCrdt.getWholeString(id);
      } else {
        return "";
      }
    }
    catch (e) {
       console.error(e); 
    }
  },

  
  /*  
  CoCreate.sendPosition({
      collection:"module_activities",
      document_id:"5e4802ce3ed96d38e71fc7e5",
      name:"name",
      startPosition: 2,
      endPositon: 2,
  })
  */
 sendPosition: function(json) {
   CoCreateCrdt.sendPosition(json);
 },


  /* 
  CoCreate.getPosition(function(data))
  CoCreate.getPosition(function(data){console.log(" EScuchando ahora  ",data)})
  */
 getPosition: function(callback){
   if(typeof miFuncion === 'function')
    CoCreateCrdt.changeListenAwereness(callback);
   else
    console.error('Callback should be a function')
 },
 
  
  /*
  sendMessage(data)
  
  param:
    data: any type (string | array | object)
  
    ex: sendMessage('name')
        sendMessage({
          name1: 'xxx',
          age: 12
        })
        sendMessage(['name', 123, 'test'])
  
  return: 
    usage: socket.on('receiveMessage', function (data) {...})
    
  */
 
 sendMessage: function(data) {
   let request_data = this.getCommonParams();
   request_data['data'] = data;
   if (!data) {
     return;
   }
   
   CoCreateSocket.send('sendMessage', request_data);
 },
 
 /*
 sendGeneralMessage({
    type: socket | io,
    operator: 'broadcast | to',
    namespace: '',
    rooms: [r1, r2],
    socket_ids: [r1, r2],
    emit: {
      message': 'nice game',
      data': 'let's play a game ....'
    }
  })
 */
 sendGeneralMessage: function(data) {
    let request_data = this.getCommonParams();
    
    if (!data || !data.emit) {
      return;     
    }
    request_data = {...request_data, ...data}
    CoCreateSocket.send('sendGeneralMessage', request_data)
 },
 
 initRenderCrdtData: function(data) {
    const metadata = data.metadata
    const id = metadata.id;
    const selected_doc = CoCreateCrdt.docs[id];
		if (!selected_doc) return;
		
		const info = CoCreateYSocket.parseTypeName(id);
		
		console.log(selected_doc.socket.awareness.getStates().size);
		
		console.log(CoCreateCrdt.getWholeString(id))
		
		
 }
 
 
  /**
  Functions YJS
  */
}

