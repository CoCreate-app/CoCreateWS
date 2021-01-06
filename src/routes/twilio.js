var express = require('express');
var path = require('path');
var router = express.Router();
const config = require('../config/config_twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const ClientCapability = require('twilio').jwt.ClientCapability;
const client = require('twilio')(config.accountSid, config.authToken);
const url_twilio = 'https://server.cocreate.app:8088/twilio';


const accountId = 'ACa677caf4788f8e1ae9451097da1712d0';	
const authToken = '836b57fefa38c2ca2a40c1bfb2566dab'; 	
let twilio = require('twilio')(accountId, authToken);


router.get('/token/:clientName?', (req, res) => {
  //accept CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // put your Twilio API credentials here
  const accountSid = config.accountSid;
  const authToken = config.authToken;
//  console.log(req.params.clientName)
  const clientName = (typeof(req.params.clientName) != undefined) ? req.params.clientName : config.clientName; //before joey
  // put your Twilio Application Sid here
  const appSid = config.appSid;
  const capability = new ClientCapability({
    accountSid: accountSid,
    authToken: authToken,
  });

  capability.addScope(
    new ClientCapability.OutgoingClientScope({ applicationSid: appSid })
  );

  capability.addScope(
      new ClientCapability.IncomingClientScope(clientName));
  
  console.log("clientName",clientName)
  
  //const token = capability.generate(86400);
  const token = capability.toJwt();

  res.set('Content-Type', 'application/jwt');
  //res.send(token);
  res.json({
   token: token
  });
});

router.post('/incomming347',(req, res)=>{
  let data_original = {...req.body};
  //console.log("Incomming data_original ",data_original)
  const twiml = new VoiceResponse();
  let { from  } = req.query;
  //console.log(req.query)
   from = (data_original.From)  ? data_original.From : decodeURIComponent(from);
  //const dial = twiml.dial({ callerId: from });
  const dial = twiml.dial();
  let clientName = '';
/*  switch (from) {
    case '+16027372368':
      clientName = 'jean';
    break;
    
    default:
      //dial.client(config.clientName);
      clientName = 'frankie';
  }*/
  
  dial.client('jean');
  
  //console.log("from",from,clientName)
 // console.log(twiml.toString())
  
  res.type('text/xml');
  //res.send(twiml.toString());
  let response = '<?xml version="1.0" encoding="UTF-8"?>\
    <Response>\
      <Dial>\
        <Client statusCallbackEvent="initiated ringing answered completed" statusCallback="https://server.cocreate.app:8088/twilio/calls_events" statusCallbackMethod="POST">jean</Client>\
      </Dial>\
    </Response>'
  res.send(response);
})

router.post('/listen_record',(req, res)=>{
  let data_original = {...req.body};
  console.log("Listen_recording ",data_original);
});


router.post('/simulatefail',(req, res)=>{
  res.send('<?xml version="1.0" encoding="UTF-8"?>\
<Response>\
    <Play>https://server.cocreate.app/CoCreate-components/CoCreate-api-twilio/music/amit12345.mp3</Play>\
</Response>');
});

router.post('/incomming602',(req, res)=>{
  let data_original = {...req.body};
  //console.log("Incomming data_original ",data_original)
  const twiml = new VoiceResponse();
  let { from  } = req.query;
//  console.log(req.query)
   from = (data_original.From)  ? data_original.From : decodeURIComponent(from);
  const dial = twiml.dial({ callerId: from });
  dial.client('frankie');
  res.type('text/xml');
  //res.send(twiml.toString());
  res.send('<?xml version="1.0" encoding="UTF-8"?>\
      <Response>\
        <Dial action="https://server.cocreate.app:8088/twilio/simulatefail" timeout="5">\
          <Client>frankie</Client>\
          <Client>jean</Client>\
        </Dial>\
      </Response>');
})

router.post('/voice', async (req, res) => {
  // Create TwiML response
  let { friendlyname } = req.body;
  const twiml = new VoiceResponse();
  let data_original = {...req.body};
  const { opt } = req.body;
  let  dial = '';
  switch (opt) {
    case 'joinConference':
        friendlyname = friendlyname ? friendlyname : 'cocreateDefault'
        dial = twiml.dial();
        dial.conference(friendlyname);
      break;
    case 'queue':
      /*
      console.log(" QUEUE ",opt,data_original)
      const data_parent = await twilio.calls(data_original["CallSid"]).fetch()
      console.log("data_parent ",data_parent)
      const connection = require('../config/dbConnection.js');
      const db = await connection(socket.config['organization_Id']); // obtenemos la conexión   
      let collection_name = "testtwillio";
      const collection = db.collection(collection_name);
      let callData = await collection.findOne({"ParentCallSid":data_original["CallSid"]});
      CoCreateCRUD.UpdateDocument({
          collection: collection_name,
          data: {'status':opt},
          broadcast_sender: true,
          broadcast: true,
          document_id : callData._id.toString()
      }, socket.config);
     */ 
      friendlyname = friendlyname ? friendlyname : 'cocreateDefault'
      twiml.dial().queue(friendlyname);
    break;
    
    default:
      let from = (data_original.From) ? data_original.From : '+16027372368';
      dial = twiml.dial({ callerId: from });
      //dial.number(data_original.To);
      dial.number({
          statusCallbackEvent: 'initiated ringing answered completed',
          statusCallback: url_twilio+'/calls_events',
          statusCallbackMethod: 'POST'
      },data_original.To);
      
  }
  console.log("Voice ",twiml.toString())
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
});


const CoCreateCRUD = require("./core/CoCreate-CRUD.js")
/**
 * Socket init 
 */
 
const socket = {
                  "config": {
                    "apiKey": "c2b08663-06e3-440c-ef6f-13978b42883a",
                  	"securityKey": "f26baf68-e3a9-45fc-effe-502e47116265",
                  	"organization_Id": "5de0387b12e200ea63204d6c"
                  },
                  "host": "server.cocreate.app:8088"
              }
CoCreateCRUD.CoCreateSocketInit(socket)

CoCreateCRUD.listen('readDocumentList', function(data) {
  console.log(data);
})
  

router.post('/calls_events_conference', async (req, res)=>{
  
  const connection = require('../config/dbConnection.js');
  const db = await connection(socket.config['organization_Id']); // obtenemos la conexión   
  let collection_name = "testtwillio";
  const collection = db.collection(collection_name);
  let callData = {};
  
  let data_original = {...req.body};
  console.log("Conference events "+data_original['StatusCallbackEvent'])
  console.log("Conference ",data_original)
  
  let status = data_original['StatusCallbackEvent'];
  
  switch (status) {
    case 'participant-leave':
    case 'conference-end':
      console.log(" GET DATA in conference-end ",{"ConferenceSid":data_original["ConferenceSid"]})
      callData = await collection.findOne({"ConferenceSid":data_original["ConferenceSid"]});
      console.log(callData.ParentCallSid)
      console.log("GET data sucessfully "+callData._id+ callData["ParentCallSid"])
      //data_original = Object.assign({}, data_original, callData)
      const data_parent = await twilio.calls(callData["ParentCallSid"]).fetch()
      if(Object.keys(data_parent).indexOf('from') !== -1 && data_parent['from'].indexOf('client') === -1){
            data_parent["direction"] = 'inbound-dial';
        }else{
            data_parent["direction"] = 'outbound-dial';
        }
      //data_original = Object.assign({}, data_original, data_parent)
      data_original = data_parent;
      //data_original['status'] = 'complete';
    break;
    case 'participant-hold':
      data_original['status'] = 'hold-conference';
    break;
    case 'participant-join':
      data_original['status'] = 'hold';
    break;
    case 'participant-speech-start':
      data_original['status'] = 'in-progress-conference';
    break;
    /*default:
      data_original['status'] = status;
      */
      //callData = await collection.findOne(query);
    
  }
  console.log("+++++++++++++++++++++++++++++ "+data_original['status'])
  if(data_original['status'] !== 'completed')
  {
    callData = await collection.findOne({"ParentCallSid":data_original["CallSid"]});
    if(callData==null)
      callData = await collection.findOne({"ConferenceSid":data_original["ConferenceSid"]});
  }
  console.log("ID ",callData._id,data_original['status'])
  //console.log("ID ",callData._id.toString())
  
  CoCreateCRUD.UpdateDocument({
      collection: collection_name,
      data: data_original,
      broadcast_sender: true,
      broadcast: true,
      document_id : callData._id.toString()
  }, socket.config);
  
  //console.log({"ConferenceSid":data_original["ConferenceSid"]})
  
  
  //Object.assign({}, {'total':15}, {'param':23})
  
});

router.post('/calls_events', async (req, res)=>{
  

  const connection = require('../config/dbConnection.js');
  const db = await connection(socket.config['organization_Id']); // obtenemos la conexión   
  let collection_name = "testtwillio";
  const collection = db.collection(collection_name);
  let callData = {};
  let data_original = {...req.body, organization_id: socket.config.organization_Id};
  let status = data_original['CallStatus']
  
  
	
	
	//console.log("DATA event ",data_original)
	
  const data_parent = await twilio.calls(data_original["ParentCallSid"]).fetch()
  if(Object.keys(data_parent).indexOf('from') !== -1 && data_parent['from'].indexOf('client') === -1){
    data_original["direction"] = data_parent["direction"] = 'inbound-dial';
    console.log(data_parent['from'])
  }else{
    data_original["direction"] = data_parent["direction"] = 'outbound-dial';
  }
  data_original['status'] = status
  data_parent['status'] = status

			
  
  switch (status) {
    case 'ringing':
          CoCreateCRUD.CreateDocument({
            	collection: collection_name,
            	broadcast_sender: true,
            	broadcast: true,
            	data: data_original,
          }, socket.config);
      
      break;
      case 'in-progress':
      case 'answered':
        callData = await collection.findOne({"CallSid":data_original["CallSid"]});
        CoCreateCRUD.UpdateDocument({
          collection: collection_name,
          data: data_original,
          broadcast_sender: true,
          broadcast: true,
          document_id : callData._id.toString()
        }, socket.config);
        break;
      case 'completed':
      case 'busy':
      case 'no-answer':
        callData = await collection.findOne({"CallSid":data_original["CallSid"]});
        if(callData == null)
          callData = await collection.findOne({"ParentCallSid":data_original["ParentCallSid"]});
        status_update = (callData["status"] !=='hold') ? status : callData["status"];
        data_parent["status"] = status_update;
        data_parent["CallStatus"] = status;
        data_parent["CallSid"] = data_original["CallSid"]
        
        CoCreateCRUD.UpdateDocument({
          collection: collection_name,
          data: data_parent,
          broadcast_sender: true,
          broadcast: true,
          document_id : callData._id.toString()
        }, socket.config);
        break;
  }
  console.log("Events -> "+status)
  //console.log(data_original)
  //HERE save JSON in BD
  
});

router.get('/actions_twiml', (req, res)=>{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  let data_original = {...req.body};
  const { opt , CallSid } = req.query;
  const twiml = new VoiceResponse();
    switch (opt) {
      case 'holdmusic':
          twiml.play('https://server.cocreate.app/CoCreate-components/CoCreate-api-twilio/music/amit12345.mp3');
      break;
      default:
        twiml.say('Hey, Thanks for calling!');
    } 
    //res.send(req.query);
    res.set('Content-Type', 'text/xml');
    console.log("twiml -> " + twiml.toString())
    res.send(twiml.toString());
})


module.exports = router;