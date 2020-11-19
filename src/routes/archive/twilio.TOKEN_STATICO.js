var express = require('express');
var path = require('path');
var router = express.Router();
const config = require('../config/config_twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const ClientCapability = require('twilio').jwt.ClientCapability;
const client = require('twilio')(config.accountSid, config.authToken);
const url_twilio = 'https://server.cocreate.app:8088/twilio/actions_twiml';


router.get('/token', (req, res) => {
  //accept CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // put your Twilio API credentials here
  const accountSid = config.accountSid;
  const authToken = config.authToken;
  const clientName = config.clientName; //before joey
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
  
  //const token = capability.generate(86400);
  const token = capability.toJwt();

  res.set('Content-Type', 'application/jwt');
  //res.send(token);
  res.json({
   token: token
  });
});

router.post('/incomming',(req, res)=>{
  let data_original = {...req.body};
  console.log("Incomming data_original ",data_original)
  const twiml = new VoiceResponse();
  let { from  } = req.query;
  console.log(req.query)
   from = (data_original.From)  ? data_original.From : decodeURIComponent(from);
  const dial = twiml.dial({ callerId: from });
  dial.client(config.clientName);
  res.type('text/xml');
  res.send(twiml.toString());
})

router.post('/voice', (req, res) => {
  // Create TwiML response
  const twiml = new VoiceResponse();
  let data_original = {...req.body};
  const { opt } = req.body;
  let  dial = '';
  switch (opt) {
    case 'joinConference':
      let { friendlyname } = req.body;
        friendlyname = friendlyname ? friendlyname : 'cocreateDefault'
        dial = twiml.dial();
        dial.conference(friendlyname);
      break;
    
    default:
      let from = (data_original.From) ? data_original.From : '+16027372368';
      dial = twiml.dial({ callerId: from });
      dial.number(data_original.To);
  }
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
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