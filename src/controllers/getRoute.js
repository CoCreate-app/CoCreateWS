var utils = require("./utils.js");
var config = require('../../config.json');


module.exports.getRouteMongo = async (req, res, next) => {
    //console.log("URL=> ",req.url , " req.hostname ", req.hostname)
    
    /**
     * Create Route in mongo
        db.routes.insertOne({ domains: ["server.cocreate.app","cocreate.app"], route: '/test/twiml', collection: "module_activities", document_id: '5ee3937ce3fc3a5b7493dc37' ,name : '<?xml version="1.0" encoding="UTF-8"?><Response><Say>Hello World</Say></Response>',content_type : 'text/xml'})
    
    //////////////////// QUERY
        db.routes.findOne({domains: { $in: [hostname] }  , route : route_uri});
    */
    
    let hostname = req.hostname; //domain
    let url = req.url; // route/*
    let route_uri = url.split(req.hostname)[0];
    console.log(" route_uri => ", route_uri,' hostname ',hostname)
    let organization = await utils.organizationsfindOne({domain:hostname},'5ae0cfac6fb8c4e656fdaf92' /** masterDB **/)
    if(organization==null){
        res.send('Error Get Organization by Domain =>'+hostname);
        return null;
    }else{
        
        
    //'5de0387b12e200ea63204d6c'
    let organization_id = organization._id.toString();
    console.log("Organization ",organization_id)
        let route = await utils.routesfindOne({hostname:hostname , route_uri : route_uri  },organization_id);
        
        console.log("routes =>",route)
        
        //https://server.cocreate.app:8088/routes/test/twiml
    
        if (route!=null){
            var route_export = await utils.getDocument({'collection':route['collection'],'document_id':route['document_id']},organization_id);
            if(route_export!=null){
                let content_type = '';
                let ext = route_uri.indexOf('.')!=-1 ? route_uri.split('.')[route_uri.split('.').length-1] : 'html';
                switch(ext){
                    case 'css':
                        content_type = 'text/css'
                    break;
                    case 'js':
                        content_type = 'text/javascript'
                    break;
                    case 'xml':
                        content_type = 'text/xml'
                    break;
                    default:
                        content_type = 'text/html'
                }
                //let content_type = route['content_type'] ? route['content_type'] : 'text/html';
                res.setHeader('content-type', content_type);
                res.send(route_export[route['name']]);
            }
            else {
                res.send('Error Get ROute Document Export Collection -> '+route['collection'] + ' document_id -> '+route['document_id']);
            }
        }
        else {
                res.send('No Found this ROute in ours BD  Host ['+hostname+'] and OrgId ['+organization_id+']  '+JSON.stringify(organization)+'<br/>'+config.db_url);
        }
    }
    
}
module.exports.getRoute = async (req, res, next) => {
    
    // to test -> http://52.207.107.241:8081/organization/hello/org
    // -> https://server.cocreate.app:8088/organization/test/frank
    
    /*
    db.organizations.findOneAndUpdate(
       { _id:ObjectId('5de0387b12e200ea63204d6c') },
       { $set: { "routes" : [{
                        route: '/test/frank',
                        collection: 'module_activities',
                        document_id: "5e4802ce3ed96d38e71fc7e5",
                        name: 'name1',
                      },
                      {
                        route: '/hello/jean',
                        collection: 'modules',
                        document_id: '5de03fc7c745412976891134',
                        name: 'html',
                      },
                      {
                        route: '/hello/org',
                        collection: 'organizations',
                        document_id: '5f03eb8462181154025cd876',
                        name: 'name',
                      }
                      ]} },
       {  upsert:true, returnNewDocument : true }
    );
    */
    
    console.log("URL=> ",req.url , " req.hostname ", req.hostname)
    let route_uri = req.url.split('/organization')[1];
    let organization_id = '5de0387b12e200ea63204d6c';
    
    var org = await utils.getDocument({'collection':'organizations','document_id':organization_id});
    var route = org.routes.find(element => element.route.toLowerCase() == route_uri);
    if (typeof route != 'undefined'){
        console.log(" ROute ",route);
        var result = await utils.getDocument(route);
        console.log("Result ",result)
        res.send(result[route.name]);
    }
    else {
        let list_route = '<ul>'
        org.routes.forEach(function(route) {   
            list_route += '<li>'+route.route+'</li>';
        });
        list_route += '</ul>'
            res.send('No Found this ROute in ours BD '+list_route);
    }
}

