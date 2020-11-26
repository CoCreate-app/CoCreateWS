var express = require('express');
var path = require('path');
var router = express.Router();
var utils = require("../controllers/utils.js");
const GetRouteOrganization = require('../controllers/getRoute');


/* GET home page. */
router.get('/test', function(req, res, next) {
    res.send('index static from SERVER NODE');
});


router.get('/css', function(req, res, next) {
    res.setHeader('content-type', 'text/css');
    res.send('.mainbtn{background-color:blue}');
});


router.get('/js', function(req, res, next) {
    res.setHeader('content-type', 'text/javascript');
    res.send('alert("Hola from erver")');
});


router.get('/twiml', function(req, res, next) {
    res.setHeader('content-type', 'text/xml');
    res.send('<?xml version="1.0" encoding="UTF-8"?>\
              <Response>\
                   <Say>Hello World</Say>\
              </Response>');
});



/* GET search result page. 
router.get('/searchresult', function(req, res, next) {
  res.sendFile(global.appRoot + '/public/searchresult.html');
});
*/
/*  var  my_routes = [
                      {
                        //route: '/test/frank',
                        route: '/test/*',
                        collection: 'module_activities',
                        document_id: "5e4802ce3ed96d38e71fc7e5",
                        name: 'name1',
                      },
                      {
                        route: '/hello/jean',
                        collection: 'modules',
                        document_id: '5de03fc7c745412976891134',
                        name: 'html',
                      }
                  ];
  
  
  my_routes.forEach(function(config) {    
  console.log(config.route);
  
  router.get(config.route, async function(req, res, next) {
        console.log(config.route)
        var result = await utils.getDocument(config);
        console.log(result)
        res.send(result[config.name]);
  });
  
});
*/

router.get('/organization/*', GetRouteOrganization.getRoute);
//router.get('/routes/*', GetRouteOrganization.getRouteMongo);
router.get('/*', GetRouteOrganization.getRouteMongo);

module.exports = router;
