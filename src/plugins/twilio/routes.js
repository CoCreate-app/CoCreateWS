var express = require('express');
var path = require('path');
var router = express.Router();
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const ClientCapability = require('twilio').jwt.ClientCapability;
const url_twilio = 'https://server.cocreate.app:8088/twilio';
var utils = require("../../controllers/utils.js");
const CoCreateCRUD = require("../../routes/core/CoCreate-CRUD.js")
let collection_name = "testtwillio";

router.get('/token/:clientName?', async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  try{
    const clientName = (typeof(req.params.clientName) != undefined) ? req.params.clientName : '--'; //before joey
    var bd = 'masterDB';
    var org;
    var user;
    try{
      var user = await utils.getDocument({'collection':'users','document_id':clientName},bd);
    }catch(e){
      user = 0;
    }
    if(user != 0)
      try{
        var org = await utils.getDocument({'collection':'organizations','document_id':user.organization_id},bd);
      }catch(e){
        org = 0;
      }
      console.log("ORG ",org)
    const accountSid =org.twilioAccountId;
    const authToken = org.twilioAuthToken;
    const appSid = org.twilioAppSid;
    
    const capability = new ClientCapability({
      accountSid: accountSid,
      authToken: authToken,
    });
  
    capability.addScope(
      new ClientCapability.OutgoingClientScope({ applicationSid: appSid })
    );
    capability.addScope(new ClientCapability.IncomingClientScope(clientName));
    const token = capability.toJwt();
    res.set('Content-Type', 'application/jwt');
    
    res.json({
     token: token
    });
    
  }catch(e){
    res.json({
     token: 'NoToken'
    });
  }
});

router.post('/listen_record',(req, res)=>{
  let data_original = {...req.body};
  console.log("Listen_recording ",data_original);
});

router.post('/voice', async (req, res) => {
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
      friendlyname = friendlyname ? friendlyname : 'cocreateDefault'
      twiml.dial().queue(friendlyname);
    break;
    default:
      let from = (data_original.From) ? data_original.From : '+16027372368';
      dial = twiml.dial({ callerId: from });
      dial.number({
          statusCallbackEvent: 'initiated ringing answered completed',
          statusCallback: url_twilio+'/calls_events',
          statusCallbackMethod: 'POST'
      },data_original.To);
      
  }
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
});

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
  const connection = require('../../config/dbConnection.js');
  let data_original = {...req.body};
  var org = 0
  var bd = 'masterDB'
  try{
    org = await utils.getDocumentByQuery({'collection':'organizations','twilioAccountId':data_original['AccountSid']},bd);
    const accountId =org.twilioAccountId;
    const authToken = org.twilioAuthToken;
    var twilio = require('twilio')(accountId, authToken);
  }catch(e){
    org = 0;
    console.log("Error conference GET ORG",e)
  }  
  
  const db = await connection(org["_id"].toString()); // obtenemos la conexión   
  const collection = db.collection(collection_name);
  let callData = {};

  let status = data_original['StatusCallbackEvent'];
  
  switch (status) {
    case 'participant-leave':
    case 'conference-end':
      callData = await collection.findOne({"ConferenceSid":data_original["ConferenceSid"]});
      const data_parent = await twilio.calls(callData["ParentCallSid"]).fetch()
      if(Object.keys(data_parent).indexOf('from') !== -1 && data_parent['from'].indexOf('client') === -1){
            data_parent["direction"] = 'inbound-dial';
        }else{
            data_parent["direction"] = 'outbound-dial';
        }
      data_original = data_parent;
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
  }
  if(data_original['status'] !== 'completed')
  {
    callData = await collection.findOne({"ParentCallSid":data_original["CallSid"]});
    if(callData==null)
      callData = await collection.findOne({"ConferenceSid":data_original["ConferenceSid"]});
  }
  CoCreateCRUD.UpdateDocument({
      collection: collection_name,
      data: data_original,
      broadcast_sender: true,
      broadcast: true,
      document_id : callData._id.toString()
  }, socket.config);
});

router.post('/calls_events', async (req, res)=>{
  try{
    let data_original = {...req.body}
    const connection = require('../../config/dbConnection.js');
    var org = 0
    var bd = 'masterDB'
    try{
      org = await utils.getDocumentByQuery({'collection':'organizations','twilioAccountId':data_original['AccountSid']},bd);
      const accountId =org.twilioAccountId;
      const authToken = org.twilioAuthToken;
      var twilio = require('twilio')(accountId, authToken);
    }catch(e){
      org = 0;
    }  
    const db = await connection(org["_id"].toString()); // obtenemos la conexión   
    const collection = db.collection(collection_name);
    let callData = {};
    data_original = {...data_original, organization_id: org._id.toString()};
    let status = data_original['CallStatus']
    const data_parent = await twilio.calls(data_original["ParentCallSid"]).fetch()
    if(Object.keys(data_parent).indexOf('from') !== -1 && data_parent['from'].indexOf('client') === -1){
      data_original["direction"] = data_parent["direction"] = 'inbound-dial';
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
  }catch(e){
    console.log("Error en events  ===>>> ",e.toString())
  }
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
    res.send(twiml.toString());
})

module.exports = router;