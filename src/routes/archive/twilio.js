var express = require('express');
var path = require('path');
var router = express.Router();
const config = require('../config/config_twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const ClientCapability = require('twilio').jwt.ClientCapability;



/*

router.get('/createCall', (req, res)=>{
  const accountSid = config.accountSid;
  const authToken = config.authToken;
  const client = require('twilio')(accountSid, authToken);
  client.calls
        .create({
           url: 'http://demo.twilio.com/docs/voice.xml',
           to: '+16027372368',
           from: '+18887440129'
         })
        .then(call => console.log(call.sid));
});

router.get('/outgoing', (req, res) => { 
  res.set('Content-Type', 'text/xml');
  res.type('application/xml');
  res.send('<?xml version="1.0" encoding="UTF-8"?>\
<Response>\
    <Say>Thanks for calling!</Say>\
</Response>')
});
*/


router.get('/token', (req, res) => {
  //accept CORS
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  // put your Twilio API credentials here
  const accountSid = config.accountSid;
  const authToken = config.authToken;
  const clientName = 'joey';
  const { phoneno } = req.query;

  // put your Twilio Application Sid here
  const appSid = config.appSid;

  const capability = new ClientCapability({
    accountSid: accountSid,
    authToken: authToken,
  });
  capability.addScope(
    new ClientCapability.OutgoingClientScope({ applicationSid: appSid })
  );
  
   // incoming call
    /*if (phoneno != null) {
        capability.addScope(
            new ClientCapability.IncomingClientScope(phoneno));
    }
    else {
      */
        capability.addScope(
            new ClientCapability.IncomingClientScope(clientName));
    //}
  
  
  //const token = capability.generate(86400);
  const token = capability.toJwt();

  res.set('Content-Type', 'application/jwt');
  //res.send(token);
  res.json({
   token: token
  });
});

router.post('/incomming',(req, res)=>{
  /*
  AccountSid: 'ACa677caf4788f8e1ae9451097da1712d0',
  ApiVersion: '2010-04-01',
  ApplicationSid: 'AP7a56503ca9d88d260cd79073ccc177b1',
  CallSid: 'CAec85a2ce6d7acc9752fd7a322f960b02',
  CallStatus: 'ringing',
  Called: '',
  Caller: 'client:Anonymous',
  Direction: 'inbound',
  From: 'client:Anonymous',
  To: '' }
  */
    // Get information about the incoming call, like the city associated
  // with the phone number (if Twilio can discover it)
  let data_original = {...req.body};
  console.log("Incomming data_original ",data_original)
  
  const city = req.body.FromCity ? req.body.FromCity : 'United state';

  // Use the Twilio Node.js SDK to build an XML response
  const twiml = new VoiceResponse();
  /*
  twiml.say({ voice: 'alice' }, `Never gonna give you up ${city}.`);
  twiml.play({}, 'https://demo.twilio.com/docs/classic.mp3');
  */
  let { to  } = req.query;
   to = (data_original.To)  ? data_original.To : decodeURIComponent(to);
  const dial = twiml.dial({ callerId: to });//twiml.dial();
  dial.client('joey');
  
  /*
  dial.conference('conference_cocreate',{
            startConferenceOnEnter : true,
            endConferenceOnExit: true,
          });
  */
  
  
  //dial.client(data_original.To);
  console.log(twiml.toString())
  // Render the response as XML in reply to the webhook request
  res.type('text/xml');
  res.send(twiml.toString());
})

router.post('/voice', (req, res) => {
  // Create TwiML response
  const twiml = new VoiceResponse();
  let data_original = {...req.body};
  //const MODERATOR = '+16027372368';
  //// +13472189814
  if (Object.keys(data_original).indexOf('unhold')!=-1) {
    twiml.dial().queue('support');
  }else{
      if(data_original)
      console.log("data_original ",data_original)
        if (Object.keys(data_original).indexOf('Direction')!=-1) {
          let direction = data_original.Direction
          switch (direction) {
            case 'inbound':
              let from = '+16027372368'
              //const dial = twiml.dial({ callerId: from , action:"https://server.cocreate.app:8088/twilio/actions_twiml?opt=enqueue", method:"GET"});
              const dial = twiml.dial({ callerId: from });
              dial.number(data_original.To);
    
            break;
          }
          
        } else {
          twiml.say('Hey ,Thanks for calling!');
        }
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
  const client = require('twilio')(config.accountSid, config.authToken);
  console.log( " OPT ",opt)
    switch (opt) {
      case 'hold':
        console.log(CallSid)
        
        /*
        client.calls.list({parentCallSid: CallSid})
            .then(calls => calls.forEach(c => 
            {
             console.log(c.sid) 
             c.update({
                  url :"https://server.cocreate.app:8088/twilio/actions_twiml?opt=enqueue",
                  method : "GET"
                })
            }
            ));
            */
            console.log(" ******************* ")
          /*
          client.calls.list({
              parentCallSid: CallSid
            })
            .then(calls => console.log(calls));
            */
            
            if(CallSid != undefined){
              //twiml.play('https://server.cocreate.app/CoCreate-components/CoCreate-api-twilio/music/amit12345.mp3');
              
              twiml.enqueue({
                waitUrl: 'https://server.cocreate.app:8088/twilio/actions_twiml?opt=holdmusic',
                waitUrlMethod : 'GET'
              }, 'support');
              
            
              //twiml.hangup();
              
              /*
              client.calls(CallSid)
                .update({
                  twiml : twiml.toString()
                })
                .then(call => {console.log("Updating Call ",CallSid,' TO-> ',call.to,' From ',call.from);console.log(call)});
                */
                
                client.calls(CallSid)
                .fetch()
                .then(call => {
                  client.calls(call.parentCallSid).update({
                      twiml : twiml.toString()
                    })
                  console.log("Updating Call ",CallSid,' TO-> ',call.to,' From ',call.from);console.log(call)
                  
                });
                
                
                
                /*
                .update({
                  url :"https://server.cocreate.app:8088/twilio/actions_twiml?opt=enqueue",
                  method : "GET"
                })*/
                
            }
      break;
      case 'unhold':
        twiml.dial().queue('support');
        if(CallSid != undefined){
            client.calls(CallSid)
                .fetch()
                .then(call => {
                  client.calls(call.parentCallSid).update({
                      twiml : twiml.toString()
                    })
                  console.log("Unhold Updating Call ",CallSid,' TO-> ',call.to,' From ',call.from);console.log(call)
                  
                });
        }

      break;
      case 'holding':
        twiml.say('You have a caller on hold.');
        //twiml.play('https://server.cocreate.app/CoCreate-components/CoCreate-api-twilio/music/amit12345.mp3');
        twiml.redirect({method:'GET'},'https://server.cocreate.app:8088/twilio/actions_twiml?opt=holding')
        
      break;
      case 'enqueue':
        twiml.enqueue({
                waitUrl: 'https://server.cocreate.app:8088/twilio/actions_twiml?opt=holdmusic',
                waitUrlMethod : 'GET'
            }, 'support');
      break;
      case 'queue':
        client.queues.list({limit: 20})
             .then(queues => queues.forEach(q => console.log(q.sid)));
      break;
      case 'deletequeue':
        client.queues.list({limit: 20})
             .then(queues => queues.forEach(q => {console.log("delete -> ",q.sid);client.queues(q.sid).remove() }));
      break;
      case 'listconferences':
      client.conferences
      .list({friendlyName: 'conference_cocreate', status: 'in-progress', limit: 20})
      .then(conferences => conferences.forEach(c => console.log(c.sid)));

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