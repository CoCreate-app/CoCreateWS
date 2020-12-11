'use strict'
var utils= require('../utils');
const CoCreateBase = require("../../base");
const config = require('../../config/config_twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const client = require('twilio')(config.accountSid, config.authToken);

let twilio

class CoCreateTwilio extends CoCreateBase {
	constructor(wsManager, db) {
		super(wsManager, db);
		this.init();
	}

	init() {
		if (this.wsManager) {
			this.wsManager.on('twilio',		(socket, data, roomInfo) => this.sendTwilio(socket, data, roomInfo));
		}
	}
	
	async sendTwilio(socket, data, roomInfo) {
		
		let data_original = {...data};
	    let that = this;
	    let send_response ='twilio';
        let type = data['type'];
        const twiml = new VoiceResponse();
        
        console.log("Twilio data_original ",data_original)
        console.log("type ",type)
        let url_twilio = data_original.data.url ? data_original.data.url : 'https://server.cocreate.app:8088/twilio/actions_twiml';
        console.log("1 switch ------ ")
        switch (type) {
        	/*case 'hangupCall':
        		utils.send_response(that.wsManager, socket, {"type":type,"response":{}}, send_response);
        	break;*/
        	/*case 'createConference':
        		utils.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response);
        	break;*/
        	case 'callRecordingCreate':
				client.calls(data_original.data.CallSid)
			      .recordings
			      .create()
			      .then(recording => {
			      	console.log("Createrecording Call",recording.sid)
			      	utils.send_response(that.wsManager, socket, {"type":type,"response":recording}, send_response);
			      });
			      
        	break;
        	case 'callRecordingPause':
        		client.calls(data_original.data.CallSid)
			      .recordings('Twilio.CURRENT')
			      .update({status: 'paused'})
			      .then(recording => {
			      	console.log("Pauserecording Call[callSid]",recording.callSid)
			      	utils.send_response(that.wsManager, socket, {"type":type,"response":recording}, send_response);
			      });
        	break;
        	case 'callRecordingResume':
        		client.calls(data_original.data.CallSid)
			      .recordings('Twilio.CURRENT')
			      .update({status: 'in-progress'})
			      .then(recording => {
			      	console.log("REsumerecording Call[callSid]",recording.callSid)
			      	utils.send_response(that.wsManager, socket, {"type":type,"response":recording}, send_response);
			      });
        	break;
        	case 'callRecordingList':
		        client.recordings
		      .list({callSid: data_original.data.CallSid, limit: 20})
		      .then(recordings => {
		      	
		      	let response_recordings = [];
		      	
		      	recordings.forEach(r => {
		      		r['url_public'] = 'https://api.twilio.com/2010-04-01/Accounts/'+config.accountSid+'/Recordings/'+r.sid+'.mp3';
		      		response_recordings.push(r);
		      	});
		      	
		      	utils.send_response(that.wsManager, socket, {"type":type,"response":response_recordings}, send_response)
		      });

        	break;
        	case 'dialTransfer':
        		
        		try{
        			data_original["transfer_call"] = false;
	            	let CallSid = data_original.data.CallSid;
	            	if(!CallSid){
	            		throw "NoExisteCallSid";
	            	}
	            	console.log("CallSid Updated CAll to Transfer",CallSid)
	            	//let nameEnqueue = data_original.data.nameEnqueue;
		            if(CallSid != undefined){
		                client.calls(CallSid)
		                .fetch()
		                .then(async call => {
			                await client.calls(call.parentCallSid).update({
			                    twiml : '<Response>\
										  <Dial><Client>frankie</Client></Dial>\
										</Response>'
			                });
			                utils.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response)
		                });
		            }
        		}catch(e){
        			//create conference
        			console.log("Create transfer_call")
        			data_original["transfer_call"] = true;
        			console.log("data_original" ,data_original)
        			utils.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response);
        			
        			that.wsManager.onMessage(socket, 'createDocument', data /* it will be request data */, roomInfo);
        			

        		}

        	break;
        	
        	case 'dialEnqueue':
            	let waitUrl = data_original.data.waitUrl ? data_original.data.waitUrl : url_twilio +'?opt=holdmusic' ; 
            	let CallSid = data_original.data.CallSid;
            	let nameEnqueue = data_original.data.nameEnqueue;
	            console.log(CallSid, 'dialEnqueue  nameEnqueue => ',nameEnqueue)
	            if(CallSid != undefined){
	            
	            twiml.enqueue({
		                waitUrl: waitUrl,
		                waitUrlMethod : 'GET'
		              }, nameEnqueue);
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
	                  utils.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response)
	                  
	                });
	                
	            }
			break;
			case 'getListQueues':
				console.log("getListQueues")
				client.queues.list({limit: 20})
            	.then(queues => {
            		let resultado = [];
            		queues.forEach(q => { 
            			console.log(q);
            			resultado.push({'idqueue':q.sid,'friendlyName':q.friendlyName})
            		})
            		utils.send_response(that.wsManager, socket, {"type":type,"response":resultado}, send_response);
            	});
            break;
            case 'deleteQueue':
            	console.log("deleteQueue ",data_original.data)
            	let idqueue = data_original.data.idqueue;
            	client.queues(idqueue).remove();
            	utils.send_response(that.wsManager, socket, {"type":type,"response":data_original.data}, send_response);
            break;
        	case 'dialConference':
        		console.log(data_original)
        		try{
        			data_original["create_conference"] = false;
	            	let CallSid = data_original.data.CallSid;
	            	if(!CallSid){
	            		throw "NoExisteCallSid";
	            	}
	            	console.log("CallSid Updated CAll to Conference",CallSid)
	            	//let nameEnqueue = data_original.data.nameEnqueue;
		            if(CallSid != undefined){
		                client.calls(CallSid)
		                .fetch()
		                .then(async call => {
			                let response = twiml.dial();
			                let waitUrl = data_original.data.holdUrl ? data_original.data.holdUrl : url_twilio +'?opt=holdmusic' ; 
			                console.log("CallFrom ",call.from)
							/*response.conference({
											waitUrl:waitUrl,
											waitMethod:"GET"
											},data_original.data.friendlyName);
											*/
							//response.conference(data_original.data.friendlyName);
						
							response.conference({
								    waitUrl: waitUrl,
								    waitMethod : 'GET'
								}, data_original.data.friendlyName);
							console.log(response.toString())
			                await client.calls(call.parentCallSid).update({
			                    twiml : response.toString()
			                });
			                utils.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response)
		                });
		            }
        		}catch(e){
        			//create conference
        			console.log("Create Conference")
        			data_original["create_conference"] = true;
        			console.log("data_original" ,data_original)
        			utils.send_response(that.wsManager, socket, {"type":type,"response":data_original}, send_response);
        		}
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
			      		client.conferences(data_original.data.CallSid)
				    	.participants(p.callSid)
				    	.update({hold: true, holdUrl: url_twilio+'?opt=holdmusic'})
				    	.then(participant => console.log(participant.callSid));
			      		})
			      );
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
			          conferences.forEach(c => {
			          	resultado.push({'idconference':c.sid,'friendlyName':c.friendlyName})
			          })
			          utils.send_response(that.wsManager, socket, {"type":type,"response":resultado}, send_response);	
			        })
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
			      });
        	break;
        	case 'muteParticipantsConference':
        		client.conferences(data_original.data.idconference)
		    	.participants(data_original.data.idparticipant)
		    	.update({muted: true})
		    	.then(participant => {
		    		utils.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
		    	});
        	break;
        	case 'unmuteParticipantsConference':
        		client.conferences(data_original.data.idconference)
		    	.participants(data_original.data.idparticipant)
		    	.update({muted: false})
		    	.then(participant => {
		    		utils.send_response(that.wsManager, socket, {"type":type,"response":participant.callSid}, send_response);
		    	});
        	break;
        	case 'getParticipantsConference':
        		client.conferences(data_original.data.CallSid)
			      .participants
			      .list({limit: 20})
			      .then(async participants => {
			      		let response = []
			      		for(let participant of participants) {
					        const call = await client.calls(participant.callSid)
					    	.fetch()
					    	.then(call => {return call;});
	    					participant["call"]  = call;
	    					response.push(participant);
					    }
					    let data = {'idconference':data_original.data.CallSid,'participants':response};
					    utils.send_response(that.wsManager, socket, {"type":type,"response":data}, send_response);	
			      	});
        	break;
        	/*New features*/
        }
        
        
        console.log("2 switch ------ ")
		const params = data['data'];
		
		try{
			// const { accountId, authToken } = params;
			//const accountId = 'ACa677caf4788f8e1ae9451097da1712d0';	
			const accountId = 'ACa677caf4788f8e1ae9451097da1712d0';	
			//const authToken = '21861a6b2aa4ab0359a222d30ad19d19'; 	
			const authToken = '836b57fefa38c2ca2a40c1bfb2566dab'; 	
			twilio = require('twilio')(accountId, authToken);
			console.log("Type ",type)
			switch (type) {
				case 'twilioListSubAccounts':
					this.twilioListSubAccounts(socket, type, params);
					break;
	
				case 'twilioCreateSubAccount':
					this.twilioCreateSubAccount(socket, type, params);
					break;
					
				case 'twilioDeleteSubAccount':
					this.twilioDeleteSubAccount(socket, type, params);
					break;
					
				case 'twilioPurchasePhoneNumber' :
					this.twilioPurchasePhoneNumber(socket, type, params);
					break;
					
				case 'twiliofetchAvailbleNumbers' :
					this.twiliofetchAvailbleNumbers(socket, type, params);
					break;
					
				case 'twilioGetUsage':
					this.twilioGetUsage(socket, type, params);
					break;
				
				case 'twilioPhoneNumberList':
					this.twilioPhoneNumberList(socket, type, params);
					break;
					
				case 'twilioGetBillingUsages':
					this.twilioGetBillingUsages(socket, type, params);
					break;
				case 'twilioGetIncommingPhoneNumbers':
					console.log("......twilioGetIncommingPhoneNumbers")
					this.twilioGetIncommingPhoneNumbers(socket, type, params);
					break;
				case 'twilioDeletePhoneNumber':
					this.twilioDeletePhoneNumber(socket, type, params);
					break;
				case 'updateIncomingPhoneNumber':
					this.updateIncomingPhoneNumber(socket, type, params);
					break;
			}
		} catch(error) {
			console.log("Error")
			this.handleError(socket, type, error)
		}
		
		
	}// end sendTwilio
	
	
	/*New features*/
	
	getDataFromRquest(params){
			let queryList = {};
			Object.keys(params).map(function (key) {
				let value = params[key];
				if(value != ''){
					value = isNaN(value) ? value : parseInt(value)
					queryList[key]= (value=='on') ? true : value;
				}
			});
		return queryList;
	}
	
	handleError(socket, type, error) {
        const response = {
            'object': 'error',
            'data':   error.message || error,
        };
        utils.send_response(this.wsManager, socket, { type, response }, this.module_id);
    }

	async twilioListSubAccounts(socket, type, params) {
		try {
			const subAccounts = await twilio.api.accounts.list();
			
			const response = {
				object: 'list',
				data: subAccounts,
			};
			utils.send_response(this.wsManager, socket, {"type": type,"response": response	}, this.module_id);
			
		} catch (error) {
            this.handleError(socket, type, error)
        }
        
	}

	async twilioPhoneNumberList(socket, type, params) {
		try {
			const { accountId, authToken } = params;
			const client = require('twilio')(accountId,authToken);

			const incomingPhoneNumbers = await client.incomingPhoneNumbers.list({ limit: 10 })

			const response = {
				object: 'list',
				data: incomingPhoneNumbers,
			};
			
			utils.send_response(this.wsManager, socket, {"type": type,"response": response	}, this.module_id);
			
		} catch (error) {
            this.handleError(socket, type, error)
        }
        
	} 
	
			
	async twilioGetBillingUsages(socket, type, params) {
		try {
			const { subaccountSid } = params;
			const accountId = 'ACa677caf4788f8e1ae9451097da1712d0';	
			const authToken = '21861a6b2aa4ab0359a222d30ad19d19'; 	
			const client = require('twilio')(accountId, authToken, { accountSid: subaccountSid });

			const data = await client.calls.list({ startTime : new Date(Date.UTC(2018, 0, 15, 0, 0, 0)), limit : 20 })

			const response = {
				object: 'list',
				data: data
			};
			utils.send_response(this.wsManager, socket, {"type": type,"response": response	}, this.module_id);
		} catch (error) {
            this.handleError(socket, type, error)
        }
        
	} 
	
	async twilioGetUsage(socket, type, params) {
		try {
			const { accountId, authToken ,pagesize } = params;
			const client = require('twilio')(accountId,authToken);
			const pagensize = Number(pagesize);
			
			const data = await new Promise((reslove, reject) => {
			      let i = 0;
			      const data = [];
			      client.usage.records.lastMonth.each({
			        pageSize: pagensize,
			        callback: function (call, done) {
			          data.push(call);
			          i++;
			          if (i === pagensize) {
			            done();
			          }
			        },
			        done: function (error) {
			          if (error) reject(error);
			          reslove(data);
			        }
			    });
			 });

			const response = {
				object: 'list',
				data: data,
			};
			utils.send_response(this.wsManager, socket, {"type": type,"response": response	}, this.module_id);
		} catch (error) {
            this.handleError(socket, type, error)
        }
        
	} 

	async twilioCreateSubAccount(socket, type, params) {
		try {
			const { friendlyName } = params
			const subAccount = await twilio.api.accounts.create({ friendlyName });

			utils.send_response(this.wsManager, socket, {"type": type,"response": subAccount }, this.module_id);
		
		} catch (error) {
            this.handleError(socket, type, error)
        }
        
	}
	
	async twilioDeleteSubAccount(socket, type, params) {
		try {
			const { AccountId } = params
			const subAccount =  await twilio.api.accounts(AccountId).update({status: 'closed'})
			
			utils.send_response(this.wsManager, socket, {"type": type,"response": subAccount }, this.module_id);
		
		} catch (error) {
            this.handleError(socket, type, error)
        }
        
	}

          
	async twiliofetchAvailbleNumbers(socket, type, params) {
		try {
			let { contryCode} = params
			console.log(params)
			contryCode = (typeof(contryCode)=='undefined' || contryCode=='') ? 'US' : contryCode.toUpperCase();
			//delte key contryCode
			delete params['contryCode'];
			/*let queryList = {};
			Object.keys(params).map(function (key) {
				let value = params[key];
				if(value != ''){
					value = isNaN(value) ? value : parseInt(value)
					queryList[key]= (value=='on') ? true : value;
				}
			});*/
			let queryList = this.getDataFromRquest(params);
			console.log("queryList",queryList)
			
			let available_phone_numbers = await twilio.availablePhoneNumbers(contryCode).local.list(queryList)
			const available_phone_numbers_tollFree = await twilio.availablePhoneNumbers(contryCode).tollFree.list(queryList)
			available_phone_numbers.concat(available_phone_numbers_tollFree);
			const response = {
				object: 'list',
				data: available_phone_numbers,
			};
			utils.send_response(this.wsManager, socket, {"type": type,"response": response }, this.module_id);
		
		} catch (error) {
            this.handleError(socket, type, error)
        }
        
	}
	
	async twilioPurchasePhoneNumber(socket, type, params) {
		try {
			const { phoneNumber } = params
			let queryList = this.getDataFromRquest(params);
			//queryList['phoneNumber'] = phoneNumber;
        	const incoming_phone_number = await twilio.incomingPhoneNumbers.create(queryList)
			utils.send_response(this.wsManager, socket, {"type": type,"response": incoming_phone_number }, this.module_id);
		} catch (error) {
            this.handleError(socket, type, error)
        }
        
	}
	
	async twilioGetIncommingPhoneNumbers(socket, type, params) {
		try {
			let queryList = this.getDataFromRquest(params);
			//const { phoneNumber } = params
			const filter_incoming_phone_number = await twilio.incomingPhoneNumbers.list(queryList)
			const response = {
				object: 'list',
				data: filter_incoming_phone_number,
			};
			utils.send_response(this.wsManager, socket, {"type": type,"response": response }, this.module_id);
		} catch (error) {
            this.handleError(socket, type, error)
        }
	}
	
	async twilioDeletePhoneNumber(socket, type, params) {
		try {
			const { sid } = params
			const delete_number = await twilio.incomingPhoneNumbers(sid).remove();
			const response = {
				object: 'item',
				data: delete_number,
			};
			utils.send_response(this.wsManager, socket, {"type": type,"response": response }, this.module_id);
		} catch (error) {
            this.handleError(socket, type, error)
        }
	}
	
	async updateIncomingPhoneNumber(socket, type, params) {
		try {
			const { sid } = params
			delete params['sid'];
			let queryList = this.getDataFromRquest(params);
			const update_number = await twilio.incomingPhoneNumbers(sid)
			  .update(queryList);
			const response = {
				object: 'item',
				data: update_number,
			};
			utils.send_response(this.wsManager, socket, {"type": type,"response": response }, this.module_id);
		} catch (error) {
            this.handleError(socket, type, error)
        }
	}
	
	
}//end Class 
module.exports = CoCreateTwilio;