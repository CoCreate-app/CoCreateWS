var express = require('express');
var path = require('path');
var router = express.Router();
const config = require('../config/config_twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const ClientCapability = require('twilio').jwt.ClientCapability;
const client = require('twilio')(config.accountSid, config.authToken);
const url_twilio = 'https://server.cocreate.app:8088/twilio';


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
  
  console.log("from",from,clientName)
  console.log(twiml.toString())
  
  res.type('text/xml');
  //res.send(twiml.toString());
  res.send('<?xml version="1.0" encoding="UTF-8"?><Response><Dial><Client>jean</Client></Dial></Response>');
})

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

router.post('/voice', (req, res) => {
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
  console.log("Voice ",twiml.toString())
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
});


router.post('/calls_events', (req, res)=>{
  let data_original = {...req.body};
  console.log("Events")
  console.log(data_original)
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