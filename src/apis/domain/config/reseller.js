const resellerclub = require("../lib/resellerclub");

let enviroment = 'prod'; //'test'
//let enviroment = 'test'

var url_reseller = 'https://httpapi.com'
var apikeys = {
			clientID: 732854,
			clientSecret: "9jQBWrjYNhtIakQppbhkCkpExkvoiDkd"
		}

if(enviroment == 'test'){
	apikeys = {
			clientID: 654546,
			clientSecret: "4WmYPtBgJzfbpKlHCH1ADS8QaXcLo2CS"
		}
    url_reseller = 'https://demo.myorderbox.com'//'https://test.httpapi.com'//AWS:52.203.210.252 186.92.175.161
}

resellerclub.connect(apikeys)
					.then(res => console.log(res))
					.catch(err => console.log(err));
					
module.exports.resellerclub = resellerclub;
module.exports.url_reseller = url_reseller;