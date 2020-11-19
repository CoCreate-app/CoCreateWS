'use strict'
var utils= require('../utils');
const CoCreateBase = require("../../base");
const config = require('../../config/config_twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const client = require('twilio')(config.accountSid, config.authToken);


class CoCreateTwilio extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
	}
	
	init() {
		if (this.wsManager) {
			this.wsManager.on('twilio',		(socket, data) => this.sendTwilio(socket, data));
		}
	}
	async sendTwilio(socket, data) {
		
		let data_original = {...data};
	    let that = this;
	    let send_response ='twilio';
        let type = data['type'];
        const twiml = new VoiceResponse();
        
        
        
        console.log("Twilio data_original ",data_original)
        console.log("type ",type)
        let url_twilio = data_original.data.url ? data_original.data.url : 'https://server.cocreate.app:8088/twilio/actions_twiml';

        switch (type) {
        	case 'hangupCall':
        		utils.send_response(that.wsManager, socket, {"type":type,"response":{}}, send_response);
        	break;
        	case 'holdCall':
            	console.log( data_original)
            	console.log(  data_original.data)
            	console.log(   data_original.data.CallSid)
            	let CallSid = data_original.data.CallSid;
            	let nameEnqueue = data_original.data.nameEnqueue;
	            console.log(CallSid, ' nameEnqueue => ',nameEnqueue)
	            if(CallSid != undefined){
	            /*
	            twiml.enqueue({
		                waitUrl: url_twilio+'?opt=holdmusic',
		                waitUrlMethod : 'GET'
		              }, nameEnqueue);
		              */
		              /*const twiml = new VoiceResponse();
		              let response = twiml.dial();
					response.conference('Room 1234');
					*/
	                client.calls(CallSid)
	                .fetch()
	                .then(call => {
	                
		                let response = twiml.dial();
						response.conference(call.from);
					
	                  client.calls(call.parentCallSid).update({
	                      twiml : response.toString()
	                    })
	                  console.log("Updating Call ",CallSid,' TO-> ',call.to,' From ',call.from);console.log(call)
	                  console.log(twiml.toString())
	                  
	                });
	                
	            }
                utils.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response)
            break;
        	case 'unholdConference':
        		client.conferences(data_original.data.CallSid)
			      .participants
			      .list({limit: 20})
			      .then(participants =>	
			      		participants.forEach(p => {
				      		client.conferences(data_original.data.CallSid)
					    	.participants(p.callSid)
					    	.update({hold: false})
					    	.then(participant => console.log(participant.callSid));
				      		})
			      );
        	break;
        	case 'holdConference':
        		client.conferences(data_original.data.CallSid)
			      .participants
			      .list({limit: 20})
			      .then(participants =>
				    	
			      		participants.forEach(p => {
			      			
			      			console.log(p)
			      			
			      		client.conferences(data_original.data.CallSid)
				    	.participants(p.callSid)
				    	.update({hold: true, holdUrl: url_twilio+'?opt=holdmusic'})
				    	.then(participant => console.log(participant.callSid));
			      		})
			      );
			      
			      console.log("HoldConference ------- ",CallSid)
        		/*client.conferences(data_original.data.CallSid)
			      .update({hold: true})
			      .then(conference => console.log(conference.friendlyName));
			      */
			      console.log("Finisg HoldConference ------- ")
        	break;
        	
        	case 'endConference':
        		client.conferences(data_original.data.CallSid)
			      .update({status: 'completed'})
			      .then(conference => console.log("Finish -> ",conference.friendlyName));
        	break;
        	case 'getConferences':
        		client.conferences.list(
			          {
			          status: 'in-progress',
			          limit: 20})
			        .then(conferences => {
			          let resultado = []
			          let participantes =  [];
			          /*for (const cnf of conferences) {
			          	//console.log(" Participans ",client.conferences(cnf.sid).participants).list({limit: 20})
			          	client.conferences(cnf.sid)
					      .participants
					      .list({limit: 20})
					      .then(participants => participants.forEach(p => {participantes.push(p);console.log(p)}));
					    //cnf['participants'] = await client.conferences(cnf.sid).participants
					    console.log('participantes ',participantes)
					    resultado.push(cnf)
					  }*/
					  
			          conferences.forEach(c => {
			          	console.log("cnf ",c)  //resultado.push({'idconference':c.sid})
			          	//await c['participants'] = client.conferences(c.sid).participants
			          	resultado.push({'idconference':c.sid,'friendlyName':c.friendlyName})
			              //resultado.push(c)
			          })
			          console.log(resultado)
			          utils.send_response(that.wsManager, socket, {"type":type,"response":resultado}, send_response);	
			          //return resultado;
			          
			        })
			        /*.then(listconferences => {
			        	
			        	
			        	utils.send_response(that.wsManager, socket, {"type":type,"response":listconferences}, send_response);	
			        });*/
        	break;
        	case 'delParticipantsConference':
        		client.conferences(data_original.data.idconference)
		      .participants(data_original.data.idparticipant)
		      .remove();
        	break;
        	case 'holdParticipantConference':
        		client.conferences(data_original.data.idconference)
			      .participants(data_original.data.idparticipant)
			      .update({hold: true, holdUrl: url_twilio+'?opt=holdmusic'})
			      .then(participant => {
			      	utils.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
			      	console.log(participant.callSid);
			      });
        	break;
        	case 'unholdParticipantConference':
        		client.conferences(data_original.data.idconference)
			      .participants(data_original.data.idparticipant)
			      .update({hold: false})
			      .then(participant =>{ 
			      	utils.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
			      	console.log(participant.callSid);
			      });
        	break;
        	case 'muteParticipantsConference':
        		client.conferences(data_original.data.idconference)
		    	.participants(data_original.data.idparticipant)
		    	.update({muted: true})
		    	.then(participant => {
		    		utils.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
		    		console.log("Muted Participant -> ",participant.callSid);
		    	});
        	break;
        	case 'unmuteParticipantsConference':
        		client.conferences(data_original.data.idconference)
		    	.participants(data_original.data.idparticipant)
		    	.update({muted: false})
		    	.then(participant => {
		    		utils.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
		    		console.log("UnMuted Participant -> ",participant.callSid)
		    	});
        	break;
        	case 'getParticipantsConference':
        		client.conferences(data_original.data.CallSid)
			      .participants
			      .list({limit: 20})
			      .then(async participants => {
			      	console.log(participants)
			      		console.log("Comenzo");
			      		let response = []
			      		for(let participant of participants) {
			      			console.log(participant.callSid);
					        const call = await client.calls(participant.callSid)
					    	.fetch()
					    	.then(call => {return call;});
	    					participant["call"]  = call;
	    					response.push(participant);
					    }
					    let data = {'idconference':data_original.data.CallSid,'participants':response};
					    utils.send_response(that.wsManager, socket, {"type":type,"response":data}, send_response);	
					    console.log("Finalizo ");
			      	});
			      	
        	break;
        /*	case 'hangupStopCall':
            	let CallSid = data_original.data.CallSid;
	            console.log('CallSid ',CallSid)
	            if(CallSid != undefined){
					//close call
					twiml.hangup();	                
					
	                client.calls(CallSid)
	                .fetch()
	                .then(call => {
	                  client.calls(call.parentCallSid).update({
	                      twiml : twiml.toString()
	                    })
	                  console.log("Updating Call ",CallSid,' TO-> ',call.to,' From ',call.from);console.log(call)
	                  console.log(twiml.toString())
	                  
	                });
	                
	            }
        	break;
          */  
            
        }
        
	}// end sendStripe
	
}//end Class 
module.exports = CoCreateTwilio;
