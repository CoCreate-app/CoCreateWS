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
  
  let { to  } = req.query;
   to = (data_original.To)  ? data_original.To : decodeURIComponent(to);
  //const dial = twiml.dial({ callerId: to ,action:url_twilio+'?opt=create_conference&from='+data_original.From,method: 'GET'});//twiml.dial();
  const dial = twiml.dial({ callerId: to });//twiml.dial();
  dial.client(config.clientName); //before joey
  
  console.log(twiml.toString())
  res.type('text/xml');
  res.send(twiml.toString());
})

router.post('/voice', (req, res) => {
  // Create TwiML response
  const twiml = new VoiceResponse();
  let data_original = {...req.body};
  const { opt } = req.body;
  let  dial = '';
  console.log("data_original ",data_original)
  // numbers Twilio = '+16027372368';  +13472189814 , frank -> +19418820466
  /*if (Object.keys(data_original).indexOf('unhold')!=-1) {
    twiml.dial().queue(data_original.nameEnqueue);
  }else{
      if(data_original)
        if (Object.keys(data_original).indexOf('Direction')!=-1) {
          let direction = data_original.Direction
          switch (direction) {
            case 'inbound':
              let from = (data_original.From) ? data_original.From : '+16027372368';
              const dial = twiml.dial({ callerId: from });
              dial.number(data_original.To);
    
            break;
          }
        } else {
          twiml.say('Hey ,Thanks for calling!');
        }
  }*/
  switch (opt) {
    case 'joinConference':
      const { friendlyname } = req.body;
      console.log("Join ",req.body)
      console.log("JoinConference " , friendlyname)
        dial = twiml.dial();
        dial.conference(friendlyname);
      break;
    
    default:
    console.log("cALLcREATE")
      // do it a call default
      let from = (data_original.From) ? data_original.From : '+16027372368';
      dial = twiml.dial({ callerId: from });
      dial.number(data_original.To);
  }
  console.log(twiml.toString())
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
});


router.get('/actions_twiml', (req, res)=>{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  let data_original = {...req.body};
  const { opt , CallSid } = req.query;
  const twiml = new VoiceResponse();
  console.log( " OPT ",opt)
    switch (opt) {
      case 'enqueue':
        twiml.enqueue({
                waitUrl: url_twilio+'?opt=holdmusic',
                waitUrlMethod : 'GET'
            }, 'support');
      break;
      case 'create_conference':
        const dial = twiml.dial();
        dial.conference('Room 1234');
      break;
      case 'hangup':
        twiml.hangup();
      break;
      case 'queue':
        client.queues.list({limit: 20})
             .then(queues => queues.forEach(
               q =>{ 
                 console.log(q.sid);
                 console.log(q)
                 
               }
               ));
      break;
      case 'listconferences':
        client.conferences.list(
          {friendlyName: 'Room 1234', 
          status: 'in-progress',
          limit: 20})
        .then(conferences => {
          let resultado = []
          conferences.forEach(c => {
              resultado.push(c.sid)
          })
          console.log(resultado)
          return res.send(resultado);
        });
      break;
      case 'deletequeue':
        client.queues.list({limit: 20})
             .then(queues => queues.forEach(q => {console.log("delete -> ",q.sid);client.queues(q.sid).remove() }));
      break;
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